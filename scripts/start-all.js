import { spawn } from 'node:child_process'
import net from 'node:net'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const children = []

function run(command, args, options = {}) {
  const child = spawn(command, args, { shell: process.platform === 'win32', stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit', env: { ...process.env, ...options.env } })
  children.push(child)
  return child
}

function waitForPort(host, port) {
  return new Promise((resolve, reject) => {
    const started = Date.now()
    const check = () => {
      const socket = net.createConnection({ host, port })
      socket.once('connect', () => { socket.destroy(); resolve() })
      socket.once('error', () => {
        socket.destroy()
        if (Date.now() - started > 30000) reject(new Error(`Timed out waiting for ${host}:${port}`))
        else setTimeout(check, 250)
      })
    }
    check()
  })
}

function portIsOpen(host, port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host, port })
    socket.once('connect', () => { socket.destroy(); resolve(true) })
    socket.once('error', () => { socket.destroy(); resolve(false) })
  })
}

function stopAll() {
  for (const child of children) child.kill()
}

process.on('SIGINT', stopAll)
process.on('SIGTERM', stopAll)

try {
  if (await portIsOpen('127.0.0.1', 8545)) {
    console.log('Using the existing local blockchain on port 8545.')
  } else {
    console.log('Starting local blockchain...')
    run(npmCommand, ['run', 'chain'])
    await waitForPort('127.0.0.1', 8545)
  }

  console.log('Deploying HoneyTraceability...')
  const deploy = run(npmCommand, ['run', 'deploy'], { capture: true })
  let output = ''
  deploy.stdout.on('data', chunk => {
    const text = chunk.toString()
    output += text
    process.stdout.write(text)
  })
  deploy.stderr.on('data', chunk => process.stderr.write(chunk))
  const exitCode = await new Promise(resolve => deploy.once('close', resolve))
  if (exitCode !== 0) throw new Error('Contract deployment failed')

  const match = output.match(/HoneyTraceability deployed to:\s*(0x[a-fA-F0-9]{40})/)
  if (!match) throw new Error('Could not find the deployed contract address')

  console.log(`Starting app with contract ${match[1]}`)
  run(npmCommand, ['run', 'dev'], { env: { CONTRACT_ADDRESS: match[1], PRIVATE_KEY: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' } })
} catch (error) {
  console.error(error.message)
  stopAll()
  process.exitCode = 1
}
