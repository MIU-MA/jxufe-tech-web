const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { prepare } = require('../scripts/prepare-backend-runtime.cjs')

function scratch(t) {
  const parent = fs.realpathSync(os.tmpdir())
  const root = fs.mkdtempSync(path.join(parent, 'jxufe-runtime-'))
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync(root)), parent)
    fs.rmSync(root, { recursive: true, force: true })
  })
  return root
}

test('runtime keeps backend and dynamic database dependencies at locked versions and omits frontend packages', t => {
  const output = scratch(t)
  const repo = path.resolve(__dirname, '..')
  const manifest = prepare(repo, output)
  const sourceLock = JSON.parse(fs.readFileSync(path.join(repo, 'package-lock.json'), 'utf8'))
  for (const name of ['better-sqlite3', '@nestjs/platform-express', 'reflect-metadata', 'typeorm']) {
    assert.equal(manifest.dependencies[name], sourceLock.packages[`node_modules/${name}`].version)
  }
  for (const name of ['vue', 'beasties', 'lucide-vue-next', '@scalar/nestjs-api-reference']) {
    assert.equal(manifest.dependencies[name], undefined)
  }
  assert.equal(manifest.devDependencies, undefined)
  const lock = JSON.parse(fs.readFileSync(path.join(output, 'package-lock.json'), 'utf8'))
  assert.deepEqual(lock.packages[''].dependencies, manifest.dependencies)
  assert.deepEqual(manifest.overrides, JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8')).overrides)
})

function fixture(t, code) {
  const root = scratch(t)
  fs.mkdirSync(path.join(root, 'backend', 'dist'), { recursive: true })
  fs.writeFileSync(path.join(root, 'backend', 'dist', 'main.js'), code)
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({
    version: '1.0.0', dependencies: { vue: '^3.0.0', 'better-sqlite3': '^12.0.0' },
  }))
  fs.writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify({
    lockfileVersion: 3, packages: {
      '': {}, 'node_modules/vue': { version: '3.5.24' }, 'node_modules/better-sqlite3': { version: '12.10.0' },
    },
  }))
  return root
}

test('a frontend library used by backend code is retained, including scoped package subpaths', t => {
  const root = fixture(t, "require('vue/server-renderer'); require('node:fs'); require('./app');")
  const manifest = prepare(root, path.join(root, 'output'))
  assert.equal(manifest.dependencies.vue, '3.5.24')
})

test('undeclared runtime imports fail before generating deploy manifests', t => {
  const root = fixture(t, "require('@nestjs/testing/subpath');")
  const output = path.join(root, 'output')
  assert.throws(() => prepare(root, output), /@nestjs\/testing/)
  assert.equal(fs.existsSync(output), false)
})

test('missing build or unlocked dependency fails instead of deploying an incomplete runtime', t => {
  const root = fixture(t, '')
  fs.unlinkSync(path.join(root, 'backend', 'dist', 'main.js'))
  assert.throws(() => prepare(root, path.join(root, 'output')), /先构建/)
  fs.writeFileSync(path.join(root, 'backend', 'dist', 'main.js'), '')
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'))
  delete lock.packages['node_modules/better-sqlite3']
  fs.writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify(lock))
  assert.throws(() => prepare(root, path.join(root, 'output')), /锁文件中缺少 better-sqlite3/)
})
