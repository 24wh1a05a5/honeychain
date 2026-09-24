import { Router } from 'express'
import { hives, batches, batchData, getBatchById, readings } from './data.js'
import { addEventOnChain, blockchainStatus, registerOnChain } from './blockchain.js'

const router = Router()
const users = [{ id: 'user-demo', name: 'Maya Farms', email: 'maya@example.com', password: 'demo123', role: 'beekeeper' }]

router.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password || password.length < 6) return res.status(400).json({ error: 'Name, email, and a password of at least 6 characters are required' })
  if (users.some(user => user.email === email.toLowerCase())) return res.status(409).json({ error: 'An account with this email already exists' })
  const user = { id: `user-${Date.now()}`, name, email: email.toLowerCase(), password, role: 'beekeeper' }
  users.push(user)
  res.status(201).json({ token: user.id, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

router.post('/auth/login', (req, res) => {
  const user = users.find(item => item.email === String(req.body.email || '').toLowerCase() && item.password === req.body.password)
  if (!user) return res.status(401).json({ error: 'Incorrect email or password' })
  res.json({ token: user.id, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

router.get('/health', (_req, res) => res.json({ ok: true, service: 'HoneyChain API', blockchain: blockchainStatus() }))
router.get('/auth/me', (req, res) => {
  const user = users.find(item => item.id === req.headers.authorization?.replace('Bearer ', ''))
  if (!user) return res.status(401).json({ error: 'Not signed in' })
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role })
})
router.get('/hives', (_req, res) => res.json(hives))
router.get('/hives/:id/batches', (req, res) => {
  const hive = hives.find(item => item.id === req.params.id)
  if (!hive) return res.status(404).json({ error: 'Hive not found' })
  const hiveBatches = batches
    .filter(batch => batch.hive === hive.id)
    .map(batch => {
      const verified = Boolean(batch.verified || batch.blockchain === 'Verified' || batch.qualityStatus === 'Passed')
      return { ...batch, verified, verificationStatus: verified ? 'Verified' : 'Not verified' }
    })
  res.json({ hive, batches: hiveBatches })
})
router.get('/sensors', (_req, res) => res.json({ source: 'simulator or device', readings: '/api/sensors/readings', ingest: 'POST /api/sensors/readings', readyFor: ['ESP32', 'Raspberry Pi'] }))
router.get('/sensors/readings', (_req, res) => res.json(readings))
router.post('/sensors/readings', (req, res) => {
  const { hiveId, temperature, humidity, weight, activity } = req.body
  if (!hiveId || [temperature, humidity, weight, activity].some(value => typeof value !== 'number')) {
    return res.status(400).json({ error: 'hiveId and numeric temperature, humidity, weight, activity are required' })
  }
  const reading = { hiveId, time: new Date().toISOString(), temperature, humidity, weight, activity }
  readings.push(reading)
  res.status(201).json({ stored: true, location: 'backend sensor store', blockchain: 'not written for routine readings', reading })
})
router.get('/alerts', (_req, res) => res.json([
  { id: 1, severity: 'high', title: 'Temperature spike', detail: 'HIVE-12 reached 37.8 C', time: '18 min ago' },
  { id: 2, severity: 'medium', title: 'Weight change', detail: 'HIVE-07 weight fell 1.2 kg', time: '2 hr ago' },
  { id: 3, severity: 'low', title: 'Routine inspection', detail: 'HIVE-03 inspection due tomorrow', time: 'Yesterday' }
]))
router.get('/batches', (_req, res) => res.json(batches))
router.get('/batches/:id', (req, res) => {
  const batch = getBatchById(req.params.id)
  if (!batch) return res.status(404).json({ error: 'Batch not found' })
  const verified = Boolean(batch.verified || batch.blockchain === 'Verified' || batch.qualityStatus === 'Passed')
  res.json({
    ...batch,
    purity: batch.purity || '98.5%',
    verified,
    verificationStatus: verified ? 'Verified' : 'Not verified',
    timeline: ['Hive monitored', 'Harvest recorded', 'Quality tested', 'Processed', 'Packaged', 'Distributed', 'Consumer verified']
  })
})
router.get('/quality/:id', (req, res) => res.json({ batchId: req.params.id, status: 'Passed', checks: ['Moisture', 'Pollen profile', 'Adulteration screen'] }))
router.get('/qrcode/:id', (req, res) => res.json({ batchId: req.params.id, verificationUrl: `/verify/${req.params.id}`, status: 'Active' }))
router.post('/batches', async (req, res) => {
  const batch = {
    ...req.body,
    batchId: String(req.body.batchId || `HC-${Date.now()}`),
    purity: req.body.purity || '98.5%',
    blockchain: 'Pending',
    qr: 'Ready',
    verified: req.body.qualityStatus === 'Passed'
  }

  if (batchData[batch.batchId]) {
    const index = batches.findIndex(item => item.batchId === batch.batchId)
    if (index >= 0) batches.splice(index, 1)
  }

  batchData[batch.batchId] = batch
  batches.unshift(batch)

  try {
    const chain = await registerOnChain(batch)
    batch.blockchain = chain.connected ? 'Verified' : 'Awaiting local chain'
    batch.transactionId = chain.transactionId
    batch.verified = Boolean(chain.connected) || batch.qualityStatus === 'Passed'
    batchData[batch.batchId] = { ...batch }
    res.status(201).json(batch)
  } catch (error) { res.status(502).json({ error: error.message }) }
})
router.post('/traceability/:id/events', async (req, res) => {
  try { res.json(await addEventOnChain(req.params.id, req.body.eventType, req.body.detail)) } catch (error) { res.status(502).json({ error: error.message }) }
})
router.get('/blockchain/status', (_req, res) => res.json(blockchainStatus()))
router.get('/predictions', (_req, res) => res.json({ label: 'Prototype Prediction', hiveHealth: 94, swarmRisk: 'Low', honeyProductionForecast: 1460 }))
router.get('/analytics', (_req, res) => res.json({ production: 1284, growth: 12.4, forecast: 1460, hiveHealth: 94, swarmRisk: 'Low', insight: 'Stable nectar flow detected across 3 active hives.' }))

export default router
