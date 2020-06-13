const withOffline = require('next-offline')

const nextConfig = {
  workboxOpts: {
    importScripts: ['/dump.service-worker.js'],
    mode: 'development',
  },
}

module.exports = withOffline(nextConfig)
