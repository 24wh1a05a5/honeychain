import '@nomicfoundation/hardhat-toolbox'

export default {
  solidity: {
    version: '0.8.24',
    settings: { optimizer: { enabled: true, runs: 200 }, viaIR: true }
  },
  paths: {
    sources: './blockchain/contracts',
    tests: './blockchain/test',
    cache: './blockchain/cache',
    artifacts: './artifacts'
  },
  networks: { hardhat: {}, localhost: { url: 'http://127.0.0.1:8545' } }
}
