import { expect } from 'chai'
import hre from 'hardhat'

describe('HoneyTraceability', function () {
  it('registers a batch and records its journey', async function () {
    const Contract = await hre.ethers.getContractFactory('HoneyTraceability')
    const contract = await Contract.deploy()
    await contract.waitForDeployment()
    await contract.registerBatch('HC-2026-0001', 'Maya Farms', 'Coorg, India', 'HIVE-07', '2026-09-18', 'Wildflower', 'Passed')
    await contract.addTraceabilityEvent('HC-2026-0001', 'HARVESTED', 'Harvested from HIVE-07')
    const batch = await contract.getBatch('HC-2026-0001')
    const events = await contract.getBatchEvents('HC-2026-0001')
    expect(batch.batchId).to.equal('HC-2026-0001')
    expect(events[0].eventType).to.equal('HARVESTED')
  })
})
