import hre from 'hardhat'

const { ethers } = hre
const HoneyTraceability = await ethers.getContractFactory('HoneyTraceability')
const contract = await HoneyTraceability.deploy()
await contract.waitForDeployment()
console.log(`HoneyTraceability deployed to: ${await contract.getAddress()}`)
