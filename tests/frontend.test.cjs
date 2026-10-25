const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const ts = require('typescript')
const { watchEffect, nextTick, createRenderer, h } = require('vue')
const { manifest, prune } = require('../scripts/news-pages.cjs')

function loadTs(file, dependencies = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const module = { exports: {} }
  new Function('require', 'module', 'exports', js)(name => dependencies[name] ?? require(name), module, module.exports)
  return module.exports
}

function wikiRenderer() {
  return loadTs('frontend/src/utils/wikiMarkdown.ts', {
    './markdown': loadTs('frontend/src/utils/markdown.ts'),
  }).renderWikiMarkdown
}

test('wiki search combines category and keywords across title, summary and body', () => {
  const { filterWikiArticles } = loadTs('frontend/src/utils/wikiArticles.ts')
  const articles = [
    { slug: 'a', category: 'Guide', title: 'Python notes', summary: 'Getting started', body: 'Install the tools' },
    { slug: 'b', category: 'Projects', title: 'Web app', summary: 'Python backend', body: 'Deploy the tools' },
  ]
  assert.deepEqual(filterWikiArticles(articles, ' PYTHON tools ', 'Guide').map(a => a.slug), ['a'])
  assert.equal(filterWikiArticles(articles, 'missing').length, 0)
  assert.equal(filterWikiArticles([], '').length, 0)
  assert.equal(filterWikiArticles(articles, '   ').length, 2)
})

test('chat references fit the API limit and preserve the user question', () => {
  const { buildChatMessage } = loadTs('frontend/src/utils/chatMessage.ts')
  const question = '请解释这篇文章。'.repeat(100)
  const result = buildChatMessage(question, '资料正文'.repeat(3000))
  assert.equal(result.length, 2000)
  assert.ok(result.endsWith(question))
  assert.ok(result.includes('参考资料（节选'))
  assert.equal(buildChatMessage('你好'), '你好')
  assert.equal(buildChatMessage('x'.repeat(2000), '资料'), 'x'.repeat(2000))
})

test('wiki outline points to distinct rendered headings and preserves formatted heading text', () => {
  const render = wikiRenderer()
  const result = render('# Overview\n\n## **Overview**\n\n### Use `Python` and [docs](https://example.com)\n', 'answer-1')
  assert.deepEqual(result.headings.map(h => h.text), ['Overview', 'Overview', 'Use Python and docs'])
  assert.deepEqual(result.headings.map(h => h.level), [2, 2, 3])
  assert.equal(new Set(result.headings.map(h => h.id)).size, 3)
  for (const heading of result.headings) assert.ok(result.html.includes(`id="${heading.id}"`))
  assert.ok(!result.html.includes('<h1'))
  assert.ok(result.html.includes('<strong>Overview</strong>'))
})

test('wiki heading anchors remain stable as streamed content grows', () => {
  const render = wikiRenderer()
  const partial = render('## Getting started\n\nFirst steps', 'answer-2')
  const complete = render('## Getting started\n\nFirst steps.\n\n### Next steps\n\nContinue here.', 'answer-2')
  assert.deepEqual(complete.headings[0], partial.headings[0])
  assert.equal(complete.headings.length, 2)
  assert.deepEqual(render('A response without headings.', 'plain').headings, [])
})

test('wiki rendering keeps raw HTML escaped and ignores headings inside fenced code', () => {
  const result = wikiRenderer()('<script>alert(1)</script>\n\n<h2>Fake</h2>\n\n```md\n## Example only\n```\n\n## Safe\n\n[bad](javascript:alert(1))', '" onclick="bad')
  assert.equal(result.headings.length, 1)
  assert.match(result.headings[0].id, /^[\w-]+$/)
  assert.ok(!result.html.includes('<script>'))
  assert.ok(!result.html.includes('<h2>Fake'))
  assert.ok(!result.html.includes('href="javascript:'))
})

test('streamed chunks update observers before the response ends', async t => {
  const { useChat } = loadTs('frontend/src/composables/useChat.ts', {
    '../utils/chatMessage': loadTs('frontend/src/utils/chatMessage.ts'),
  })
  let controller
  const originalFetch = global.fetch
  global.fetch = async url => url.endsWith('/token')
    ? new Response(JSON.stringify({ token: 'test-token' }))
    : new Response(new ReadableStream({ start(value) { controller = value } }))
  t.after(() => { global.fetch = originalFetch })
  const chat = useChat()
  let displayed = ''
  const stop = watchEffect(() => { displayed = chat.messages.value.at(-1)?.content ?? '' })
  t.after(stop)
  const pending = chat.send('hello')
  while (!controller) await new Promise(resolve => setImmediate(resolve))
  try {
    for (const [chunk, expected] of [['你好', '你好'], ['世界', '你好世界']]) {
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`))
      await new Promise(resolve => setImmediate(resolve))
      await nextTick()
      assert.equal(chat.isThinking.value, true)
      assert.equal(displayed, expected)
    }
  } finally {
    controller.close()
    await pending
  }
})

// 内存渲染器运行真实 Vue 挂载与更新周期，无需启动浏览器。
function mountArticleList(snapshot, fetchArticles) {
  const { useArticles, articleInitialStateKey } = loadTs('frontend/src/composables/useArticles.ts', {
    '../api/articles': { fetchArticles },
  })
  const renderer = createRenderer({
    createElement: () => ({}), createText: () => ({}), createComment: () => ({}),
    insert() {}, remove() {}, setText() {}, setElementText() {}, patchProp() {},
    parentNode: () => null, nextSibling: () => null,
  })
  let state
  const renders = []
  const app = renderer.createApp({
    setup() {
      state = useArticles()
      return () => {
        const view = { titles: state.articles.value.map(a => a.title), loading: state.loading.value, error: state.error.value }
        renders.push(view)
        return h('p', JSON.stringify(view))
      }
    },
  })
  app.provide(articleInitialStateKey, snapshot)
  app.mount({})
  return { app, state, renders }
}

test('SSG snapshot appears on first client render and refreshes without a loading flash', async t => {
  let resolveFetch
  const mounted = mountArticleList({ articles: [{ title: 'build-time news' }] },
    () => new Promise(resolve => { resolveFetch = resolve }))
  t.after(() => mounted.app.unmount())
  assert.deepEqual(mounted.renders[0], { titles: ['build-time news'], loading: false, error: false })
  resolveFetch([{ title: 'updated news' }])
  await new Promise(resolve => setImmediate(resolve))
  await nextTick()
  assert.deepEqual(mounted.renders.at(-1), { titles: ['updated news'], loading: false, error: false })
  assert.ok(mounted.renders.every(view => !view.loading))
})

test('client API failure preserves SSG content; pages without a snapshot can retry', async t => {
  const cached = mountArticleList({ articles: [{ title: 'available offline' }] }, async () => { throw new Error('offline') })
  t.after(() => cached.app.unmount())
  let online = false
  const uncached = mountArticleList({}, async () => {
    if (!online) throw new Error('offline')
    return [{ title: 'recovered news' }]
  })
  t.after(() => uncached.app.unmount())
  await new Promise(resolve => setImmediate(resolve))
  assert.deepEqual(cached.renders.at(-1), { titles: ['available offline'], loading: false, error: false })
  assert.deepEqual(uncached.renders.at(-1), { titles: [], loading: false, error: true })
  online = true
  await uncached.state.load()
  await nextTick()
  assert.deepEqual(uncached.renders.at(-1), { titles: ['recovered news'], loading: false, error: false })
})

test('article editing preserves instants and formats local wall time across time zones', () => {
  const { toLocalDateTime, toPublishedAt, formatArticleDate } = loadTs('frontend/src/utils/dateTime.ts')
  const originalTz = process.env.TZ
  try {
    for (const [zone, expected] of [['Asia/Shanghai', '2026-09-08T10:00'], ['UTC', '2026-09-08T02:00'], ['America/New_York', '2026-09-07T22:00']]) {
      process.env.TZ = zone
      const original = '2026-09-08T02:00:35.123Z'
      assert.equal(toLocalDateTime(original), expected)
      assert.equal(toPublishedAt(expected, original), original)
      assert.equal(toPublishedAt(expected), '2026-09-08T02:00:00.000Z')
      assert.equal(toPublishedAt(''), null)
      assert.equal(formatArticleDate('2026-09-07T18:00:00Z'), '2026-09-08')
    }
  } finally {
    if (originalTz === undefined) delete process.env.TZ
    else process.env.TZ = originalTz
  }
})

test('deployment removes only obsolete numeric news HTML, including an empty news list', t => {
  const tempParent = fs.realpathSync(os.tmpdir())
  const root = fs.mkdtempSync(path.join(tempParent, 'jxufe-news-test-'))
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync(root)), tempParent)
    fs.rmSync(root, { recursive: true, force: true })
  })
  const write = file => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
    fs.writeFileSync(path.join(root, file), 'test')
  }
  for (const file of ['index.html', 'news.html', 'news/2.html', 'news/3/index.html']) write(file)
  manifest(root)
  for (const file of ['news/1.html', 'news/4/index.html', 'news/help.html', 'news/2.png', 'uploads/1.html']) write(file)
  prune(root)
  for (const file of ['news/1.html', 'news/4/index.html']) assert.equal(fs.existsSync(path.join(root, file)), false)
  for (const file of ['index.html', 'news.html', 'news/2.html', 'news/3/index.html', 'news/help.html', 'news/2.png', 'uploads/1.html']) assert.equal(fs.existsSync(path.join(root, file)), true)
  fs.writeFileSync(path.join(root, 'news-pages.json'), '[]')
  prune(root)
  assert.equal(fs.existsSync(path.join(root, 'news/2.html')), false)
  assert.equal(fs.existsSync(path.join(root, 'news/3/index.html')), false)
  write('news/5.html')
  fs.writeFileSync(path.join(root, 'news-pages.json'), '{}')
  assert.throws(() => prune(root))
  fs.unlinkSync(path.join(root, 'news-pages.json'))
  assert.throws(() => prune(root))
  assert.equal(fs.existsSync(path.join(root, 'news/5.html')), true)
})
