const fs = require('node:fs')
const path = require('node:path')

const MANIFEST = 'news-pages.json'
const NEWS_PAGE = /^news\/\d+(?:\/index)?\.html$/

function newsPages(root, relative = 'news') {
  const dir = path.join(root, relative)
  if (!fs.existsSync(dir)) return []
  if (!fs.lstatSync(dir).isDirectory()) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = `${relative}/${entry.name}`
    if (entry.isDirectory()) return newsPages(root, file)
    return entry.isFile() && NEWS_PAGE.test(file) ? [file] : []
  })
}

function manifest(root) {
  if (!fs.existsSync(path.join(root, 'index.html'))) throw new Error('缺少构建首页')
  fs.writeFileSync(path.join(root, MANIFEST), JSON.stringify(newsPages(root).sort()))
}

function prune(root) {
  // 缺失或损坏的清单必须报错，不能当成空清单删除线上页面。
  const pages = JSON.parse(fs.readFileSync(path.join(root, MANIFEST), 'utf8'))
  if (!Array.isArray(pages) || !pages.every(page => typeof page === 'string' && NEWS_PAGE.test(page))) {
    throw new Error('新闻页面清单不合法')
  }
  const keep = new Set(pages)
  for (const file of newsPages(root)) {
    if (!keep.has(file)) {
      fs.unlinkSync(path.join(root, file))
      console.log(`Removed stale news page: ${file}`)
    }
  }
}

if (require.main === module) {
  const [command, root] = process.argv.slice(2)
  if (!root || !['manifest', 'prune'].includes(command)) throw new Error('Usage: news-pages.cjs manifest|prune <frontend-dir>')
  ;({ manifest, prune })[command](path.resolve(root))
}

module.exports = { manifest, prune }
