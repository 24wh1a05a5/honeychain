import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import apiRouter from './api.js'
import { connectBlockchain } from './blockchain.js'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => res.json({ service: 'HoneyChain API', website: 'http://localhost:5173', health: '/api/health' }))
app.use('/api', apiRouter)
const port = process.env.PORT || 4000
app.listen(port, async () => { await connectBlockchain(); console.log(`HoneyChain API listening on http://localhost:${port}`) })
