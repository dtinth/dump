const withOffline = require('next-offline')

const nextConfig = {
  workboxOpts: {
    importScripts: ['/dump.service-worker.js'],
  },
}

module.exports = withOffline(nextConfig)
