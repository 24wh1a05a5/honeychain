# HoneyChain

HoneyChain is a local-first AgriTech demo for honey traceability, smart hive monitoring, QR verification, and blockchain-backed records.

## Stack

- React + Vite + Recharts + Lucide
- Node.js + Express modular API router
- Solidity + Hardhat + ethers.js
- Simulated IoT readings for temperature, humidity, weight, and bee activity

## Run locally

Install dependencies once:

```powershell
npm install
```

### 1. Start the local blockchain

Terminal 1:

```powershell
npm run chain
```

### 2. Compile and deploy

Terminal 2:

```powershell
npm run deploy
```

Copy the printed contract address. For the local Hardhat account #0, set server-only environment variables in the same terminal:

```powershell
$env:CONTRACT_ADDRESS='PASTE_DEPLOYED_ADDRESS'
$env:PRIVATE_KEY='0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
npm run dev:api
```

The private key is used only by the backend and is never bundled into the frontend. Hardhat's printed keys are public demo keys for local development only.

### 3. Start the frontend

Terminal 3:

```powershell
npm run dev
```

Open `http://localhost:5173`.

## Routes

Frontend views: `/` overview, dashboard, traceability registration, and consumer verification. A direct `/verify/HC-2026-0001` path opens the verification view.

API: `/api/health`, `/api/hives`, `/api/sensors/readings`, `/api/alerts`, `/api/batches`, `/api/batches/:id`, `/api/traceability/:id/events`, `/api/blockchain/status`, and `/api/analytics`.

### Sensor data

Routine sensor readings should be sent to the backend, not directly to the blockchain. An ESP32, Raspberry Pi, or manual test can send JSON like this:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/sensors/readings -ContentType 'application/json' -Body '{"hiveId":"HIVE-07","temperature":34.2,"humidity":61,"weight":42.8,"activity":86}'
```

The current demo keeps readings in backend memory, so they reset when the server restarts. For production, store them in a database and write only important milestones or periodic data hashes to the blockchain. The blockchain should contain proof of important events, not every five-minute sensor reading.

## Tests

```powershell
npm run build
npm test
```

The contract test registers a batch and appends a `HARVESTED` event on a Hardhat in-memory network. The API demo data is intentionally local and simulated; the prediction card is labeled as a prototype insight and makes no ML accuracy claim.
