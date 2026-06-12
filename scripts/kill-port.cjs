/**
 * Cross-platform port killer.
 * Usage: node scripts/kill-port.cjs 3003 [5173 ...]
 *
 * On Windows uses netstat + taskkill.
 * On Unix uses lsof + kill.
 */
const { execSync } = require('child_process')

const ports = process.argv.slice(2)
if (!ports.length) {
  console.log('Usage: node scripts/kill-port.cjs <port> [...]')
  process.exit(0)
}

const isWin = process.platform === 'win32'

for (const port of ports) {
  try {
    if (isWin) {
      // netstat -ano | findstr ":3003 " | findstr LISTENING
      const out = execSync(
        `netstat -ano | findstr ":${port} " | findstr LISTENING`,
        { shell: 'cmd.exe', stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }
      ).trim()
      if (!out) {
        console.log(`port ${port} — free`)
        continue
      }
      const pids = new Set()
      for (const line of out.split('\n')) {
        const parts = line.trim().split(/\s+/)
        const pid = parts[parts.length - 1]
        if (pid && /^\d+$/.test(pid)) pids.add(pid)
      }
      for (const pid of pids) {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' })
        console.log(`port ${port} — killed PID ${pid}`)
      }
    } else {
      const out = execSync(`lsof -ti:${port}`, {
        stdio: ['ignore', 'pipe', 'ignore'],
        encoding: 'utf8'
      }).trim()
      if (!out) {
        console.log(`port ${port} — free`)
        continue
      }
      const pids = [...new Set(out.split('\n'))]
      for (const pid of pids) {
        execSync(`kill -9 ${pid}`, { stdio: 'ignore' })
        console.log(`port ${port} — killed PID ${pid}`)
      }
    }
  } catch {
    // no process on this port — harmless
    console.log(`port ${port} — free`)
  }
}
