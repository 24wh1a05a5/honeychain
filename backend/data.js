export const hives = [
  { id: 'HIVE-07', name: 'Coorg Highlands', location: 'Coorg, India', status: 'Optimal', temp: 34.2, humidity: 61, weight: 42.8, activity: 86 },
  { id: 'HIVE-12', name: 'Wayanad Grove', location: 'Wayanad, India', status: 'Watch', temp: 37.8, humidity: 72, weight: 38.4, activity: 64 },
  { id: 'HIVE-03', name: 'Nilgiri Valley', location: 'Nilgiris, India', status: 'Optimal', temp: 33.6, humidity: 58, weight: 46.1, activity: 91 }
]

export const batchData = {
  'HC-2026-0001': { batchId: 'HC-2026-0001', producer: 'Maya Farms', origin: 'Coorg, India', hive: 'HIVE-07', harvestDate: '18 Sep 2026', honeyType: 'Wildflower', purity: '98.7%', qualityStatus: 'Passed', processing: 'Cold filtered', blockchain: 'Verified', qr: 'Active', verified: true },
  'HC-2026-0002': { batchId: 'HC-2026-0002', producer: 'Maya Farms', origin: 'Wayanad, India', hive: 'HIVE-12', harvestDate: '12 Sep 2026', honeyType: 'Forest honey', purity: '94.2%', qualityStatus: 'In testing', processing: 'Raw', blockchain: 'Pending', qr: 'Ready', verified: false },
  'HC-2026-0003': { batchId: 'HC-2026-0003', producer: 'Maya Farms', origin: 'Nilgiris, India', hive: 'HIVE-03', harvestDate: '02 Sep 2026', honeyType: 'Eucalyptus', purity: '99.1%', qualityStatus: 'Passed', processing: 'Cold filtered', blockchain: 'Verified', qr: 'Active', verified: true }
}

export const batches = Object.values(batchData)

export const getBatchById = (batchId) => {
  if (!batchId) return null
  return batchData[String(batchId).trim()] || null
}

export const readings = Array.from({ length: 12 }, (_, index) => ({ time: `${String(7 + index).padStart(2, '0')}:00`, temperature: 32 + Math.sin(index / 2) * 2 + index / 5, humidity: 57 + Math.cos(index / 2) * 4, weight: 39 + index * 0.35, activity: 72 + Math.sin(index / 1.4) * 12 }))
