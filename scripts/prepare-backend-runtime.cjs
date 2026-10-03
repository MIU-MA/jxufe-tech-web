const fs = require('node:fs')
const path = require('node:path')
const { isBuiltin } = require('node:module')

const FRONTEND_ONLY = new Set([
  '@scalar/nestjs-api-reference', 'beasties', 'lucide-vue-next',
  'markdown-it', 'vue', 'vue-i18n', 'vue-router',
])

function requiredPackages(dir) {
  const packages = new Set()
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      for (const name of requiredPackages(file)) packages.add(name)
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      for (const match of fs.readFileSync(file, 'utf8').matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)) {
        const name = match[1]
        if (name.startsWith('.') || isBuiltin(name)) continue
        packages.add(name.startsWith('@') ? name.split('/').slice(0, 2).join('/') : name.split('/')[0])
      }
    }
  }
  return packages
}

function prepare(root, output) {
  const source = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'))
  const dist = path.join(root, 'backend', 'dist')
  if (!fs.existsSync(path.join(dist, 'main.js'))) throw new Error('请先构建后端')
  if (lock.lockfileVersion !== 3) throw new Error('运行依赖打包需要 lockfileVersion=3')
  const required = requiredPackages(dist)
  for (const name of required) {
    if (!source.dependencies?.[name]) throw new Error(`后端运行依赖 ${name} 未在 dependencies 中声明`)
  }
  // 从仓库锁文件取精确版本；SQL 驱动、平台适配器等动态加载依赖也保留。
  const dependencies = {}
  for (const name of Object.keys(source.dependencies)) {
    if (FRONTEND_ONLY.has(name) && !required.has(name)) continue
    const entry = lock.packages?.[`node_modules/${name}`]
    if (!entry?.version) throw new Error(`锁文件中缺少 ${name}`)
    dependencies[name] = entry.name && entry.name !== name ? `npm:${entry.name}@${entry.version}` : entry.version
  }
  const manifest = {
    name: 'jxufe-tech-backend-runtime', version: source.version, private: true,
    dependencies, overrides: source.overrides,
  }
  // 使用原锁文件作为种子，在 CI 中离线裁剪，保留已验证的传递依赖版本。
  lock.name = manifest.name
  lock.packages[''] = { name: manifest.name, version: manifest.version, dependencies }
  fs.mkdirSync(output, { recursive: true })
  fs.writeFileSync(path.join(output, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  fs.writeFileSync(path.join(output, 'package-lock.json'), `${JSON.stringify(lock, null, 2)}\n`)
  return manifest
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..')
  const manifest = prepare(root, path.join(root, 'deploy', 'backend'))
  console.log(`Prepared backend runtime manifest: ${Object.keys(manifest.dependencies).length} direct dependencies`)
}

module.exports = { prepare }
