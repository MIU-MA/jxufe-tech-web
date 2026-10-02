const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const { JSDOM } = require('jsdom')
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
for (const name of ['window', 'document', 'Document', 'Element', 'HTMLElement', 'SVGElement', 'Node', 'Event', 'MouseEvent', 'File', 'FormData']) {
  global[name] = dom.window[name]
}
const { createApp, h, nextTick, reactive } = require('vue')
const { parse, compileScript } = require('@vue/compiler-sfc')

const sourceCache = new Map()
function loadSource(file) {
  const filename = path.resolve(__dirname, '..', file)
  if (sourceCache.has(filename)) return sourceCache.get(filename)
  let source = fs.readFileSync(filename, 'utf8')
  if (filename.endsWith('.vue')) {
    const { descriptor } = parse(source, { filename })
    source = compileScript(descriptor, { id: 'article-editor-test', inlineTemplate: true }).content
  }
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const module = { exports: {} }
  const sourceRequire = name => name.startsWith('.')
    ? loadSource(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), `${name}.ts`)))
    : require(name)
  new Function('require', 'module', 'exports', js)(sourceRequire, module, module.exports)
  sourceCache.set(filename, module.exports)
  return module.exports
}

const Editor = loadSource('frontend/src/views/admin/articles/ArticleEditor.vue').default
const { uploadArticleImage } = loadSource('frontend/src/api/imageUpload.ts')
const originalFetch = global.fetch
const article = (content = '开头\n\n结尾', id = 1) => ({
  id, title: '文章标题', content, summary: null,
  publishedAt: '2026-09-08T02:00:35.123Z', createdAt: '2026-09-08T02:00:35.123Z',
})
const response = (url = '/uploads/test-image.png') => new Response(JSON.stringify({ url }))
const flush = async () => { await new Promise(resolve => setImmediate(resolve)); await nextTick() }

function mountEditor(t, initialArticle = article()) {
  const host = document.createElement('div')
  document.body.append(host)
  const props = reactive({ mode: 'edit', article: initialArticle, token: 'admin-test-token', saving: false })
  const saved = []
  const app = createApp({ render: () => h(Editor, { ...props, onSave: data => saved.push(data) }) })
  app.mount(host)
  t.after(() => { app.unmount(); host.remove(); global.fetch = originalFetch })
  const button = label => Array.from(host.querySelectorAll('button')).find(element => element.textContent === label)
  return { host, props, saved, button, textarea: host.querySelector('textarea'), files: host.querySelector('input[type=file]') }
}

function fileEvent(input, files) {
  Object.defineProperty(input, 'files', { configurable: true, value: files })
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function transferEvent(type, files) {
  const event = new Event(type, { cancelable: true, bubbles: true })
  Object.defineProperty(event, type === 'paste' ? 'clipboardData' : 'dataTransfer', {
    value: type === 'paste'
      ? { items: files.map(file => ({ kind: 'file', type: file.type, getAsFile: () => file })) }
      : { files, types: ['Files'] },
  })
  return event
}

test('file selection uploads with authentication, inserts at cursor, previews and saves the image', async t => {
  const ui = mountEditor(t)
  let finishUpload
  global.fetch = async (url, init) => {
    assert.equal(url, '/api/upload/image')
    assert.equal(init.headers.Authorization, 'Bearer admin-test-token')
    assert.equal(init.headers['Content-Type'], undefined)
    assert.equal(init.body.get('image').name, '活动照片.png')
    return await new Promise(resolve => { finishUpload = resolve })
  }
  ui.textarea.setSelectionRange(2, 2)
  ui.button('上传图片').click()
  fileEvent(ui.files, [new File(['image'], '活动照片.png', { type: 'image/png' })])
  await nextTick()
  assert.equal(ui.textarea.readOnly, true)
  assert.equal(ui.button('保存修改').disabled, true)
  ui.button('保存修改').click()
  assert.equal(ui.saved.length, 0)
  finishUpload(response())
  await flush()
  assert.match(ui.textarea.value, /^开头\n\n!\[活动照片\]\(\/uploads\/test-image.png\)/)
  assert.ok(ui.textarea.value.endsWith('结尾'))
  assert.equal(ui.textarea.readOnly, false)
  assert.equal(ui.textarea.selectionStart, ui.textarea.value.indexOf('结尾') - 2)
  assert.equal(ui.files.value, '')
  ui.button('预览正文').click()
  await nextTick()
  assert.equal(ui.host.querySelector('.prose img').getAttribute('src'), '/uploads/test-image.png')
  ui.button('返回编辑').click()
  await nextTick()
  ui.button('保存修改').click()
  assert.equal(ui.saved[0].content, ui.textarea.value)
  assert.equal(ui.saved[0].publishedAt, '2026-09-08T02:00:35.123Z')
})

test('pasted screenshots upload directly and ordinary text paste is left to the browser', async t => {
  const ui = mountEditor(t, article('正文'))
  global.fetch = async (_url, init) => {
    assert.equal(init.body.get('image').name, 'image.png')
    return response('/uploads/screenshot.png')
  }
  ui.textarea.setSelectionRange(2, 2)
  const paste = transferEvent('paste', [new File(['image'], 'image', { type: 'image/png' })])
  ui.textarea.dispatchEvent(paste)
  assert.equal(paste.defaultPrevented, true)
  await flush()
  assert.ok(ui.textarea.value.includes('/uploads/screenshot.png'))
  const textPaste = transferEvent('paste', [])
  ui.textarea.dispatchEvent(textPaste)
  assert.equal(textPaste.defaultPrevented, false)
})

test('multiple dropped files keep image order and report invalid files without losing successful uploads', async t => {
  const ui = mountEditor(t, article('已有正文'))
  const uploadedNames = []
  global.fetch = async (_url, init) => {
    uploadedNames.push(init.body.get('image').name)
    return response(`/uploads/image-${uploadedNames.length}.png`)
  }
  ui.textarea.setSelectionRange(4, 4)
  const drop = transferEvent('drop', [
    new File(['image'], '第一张.png', { type: 'image/png' }),
    new File(['<svg/>'], '不支持.svg', { type: 'image/svg+xml' }),
    new File(['image'], '第二张.png', { type: 'image/png' }),
  ])
  ui.textarea.dispatchEvent(drop)
  assert.equal(drop.defaultPrevented, true)
  await flush()
  assert.deepEqual(uploadedNames, ['第一张.png', '第二张.png'])
  assert.ok(ui.textarea.value.startsWith('已有正文'))
  assert.ok(ui.textarea.value.indexOf('第一张') < ui.textarea.value.indexOf('第二张'))
  assert.match(ui.host.querySelector('[role=alert]').textContent, /不支持.svg/)
  assert.equal(ui.host.querySelector('[role=status]').textContent, '已插入 2 张图片')
  assert.equal(ui.button('保存修改').disabled, false)
})

test('switching articles aborts pending uploads and never inserts the old response into the new article', async t => {
  const ui = mountEditor(t)
  let finishUpload, signal
  global.fetch = async (_url, init) => {
    signal = init.signal
    return await new Promise(resolve => { finishUpload = resolve })
  }
  fileEvent(ui.files, [new File(['image'], 'old.png', { type: 'image/png' })])
  await nextTick()
  ui.props.article = article('另一篇正文', 2)
  await nextTick()
  assert.equal(signal.aborted, true)
  finishUpload(response())
  await flush()
  assert.equal(ui.textarea.value, '另一篇正文')
  assert.equal(ui.host.querySelector('[role=status]'), null)
})

test('failed upload preserves selected text; preview escapes raw HTML', async t => {
  const ui = mountEditor(t, article('保留原文<script>alert(1)</script>'))
  global.fetch = async () => new Response(JSON.stringify({ message: '文件内容与图片格式不符' }), { status: 400 })
  ui.textarea.setSelectionRange(0, 4)
  ui.button('上传图片').click()
  fileEvent(ui.files, [new File(['fake'], 'bad.png', { type: 'image/png' })])
  await flush()
  assert.equal(ui.textarea.value, '保留原文<script>alert(1)</script>')
  assert.match(ui.host.querySelector('[role=alert]').textContent, /文件内容与图片格式不符/)
  ui.button('预览正文').click()
  await nextTick()
  assert.equal(ui.host.querySelector('.prose script'), null)
  assert.ok(ui.host.querySelector('.prose').textContent.includes('<script>'))
})

test('image helper rejects oversized files and unsafe responses, and supplies MIME for files without it', async t => {
  t.after(() => { global.fetch = originalFetch })
  const signal = new AbortController().signal
  let requests = 0
  global.fetch = async (_url, init) => {
    requests++
    assert.equal(init.body.get('image').type, 'image/png')
    return response('/uploads/validated.png')
  }
  const oversized = new File(['x'], 'big.png', { type: 'image/png' })
  Object.defineProperty(oversized, 'size', { value: 10 * 1024 * 1024 + 1 })
  await assert.rejects(uploadArticleImage(oversized, 'token', signal), /10 MB/)
  await assert.rejects(uploadArticleImage(new File(['svg'], 'x.svg', { type: 'image/svg+xml' }), 'token', signal), /只支持/)
  assert.equal(requests, 0)
  assert.equal(await uploadArticleImage(new File(['image'], 'x.png'), 'token', signal), '/uploads/validated.png')
  global.fetch = async () => response('javascript:alert(1)')
  await assert.rejects(uploadArticleImage(new File(['image'], 'x.png', { type: 'image/png' }), 'token', signal), /有效的图片地址/)
})
