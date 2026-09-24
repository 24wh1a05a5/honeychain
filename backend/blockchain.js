import { ethers } from 'ethers'
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
dotenv.config()

const abiPath = path.resolve('artifacts/blockchain/contracts/HoneyTraceability.sol/HoneyTraceability.json')
let contract

export function blockchainStatus() {
  return { connected: Boolean(contract), address: process.env.CONTRACT_ADDRESS || null, network: 'Local Hardhat' }
}

export async function connectBlockchain() {
  if (!process.env.CONTRACT_ADDRESS || !fs.existsSync(abiPath)) return false
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545')
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider)
  const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'))
  contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, artifact.abi, wallet)
  return true
}

export async function registerOnChain(batch) {
  if (!contract) return { connected: false, transactionId: null }
  const tx = await contract.registerBatch(batch.batchId, batch.producer, batch.origin, batch.hive, batch.harvestDate, batch.honeyType, batch.qualityStatus)
  const receipt = await tx.wait()
  return { connected: true, transactionId: receipt.hash, blockNumber: receipt.blockNumber }
}

export async function addEventOnChain(batchId, eventType, detail) {
  if (!contract) return { connected: false, transactionId: null }
  const tx = await contract.addTraceabilityEvent(batchId, eventType, detail)
  const receipt = await tx.wait()
  return { connected: true, transactionId: receipt.hash, blockNumber: receipt.blockNumber }
}
