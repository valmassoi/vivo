const _ = require('lodash')
const axios = require('axios')
const colors = require('colors')

const myIp = process.env.MY_IP || ''
console.log('MY_IP:', myIp)
const avgBlockTime = 2 // 2mins

const url = `http://vivo.explorerz.top:3003/ext/masternodes?_=${Date.now()}`

function runRequest() {
  axios.get(url)
  .then(data => {
    const nodes = data.data.data
    const activeNodes = _.filter(nodes, { 'status': 'ENABLED' })
    console.log(colors.blue(`Active Nodes: ${activeNodes.length} of Total: ${nodes.length}`))
    const sortedActiveNodes = _.sortBy(activeNodes, [(o) => Number(o.lastpaid)])
    // console.log(sortedActiveNodes)
    const myNode = _.filter(nodes, { 'ip': myIp })[0]
    console.log('My Node:', myNode)
    const myNodeIndex = _.indexOf(sortedActiveNodes, myNode)
    if (myNode.status !== 'ENABLED') {
      console.log(colors.red('MY MASTERNODE IS DOWN!'))
    } else {
      const neverPaid = _.filter(sortedActiveNodes, { 'lastpaid': '0' }).length
      console.log(colors.green(`Reward queue: ${activeNodes.length - myNodeIndex}* of (${activeNodes.length - neverPaid}**)${activeNodes.length}`),
      `
      *higher = sooner reward
      **excludes neverpaid - new MNs`)
      const lowerBound = avgBlockTime * (myNodeIndex - neverPaid)
      const upperBound = avgBlockTime * myNodeIndex
      console.log(`Payout in ~${lowerBound} - ${upperBound} mins (${(lowerBound / 60).toFixed(2)} - ${(upperBound / 60).toFixed(2)} hrs)`)
    }
  })
  .catch(err => console.log(err))
  setTimeout(() => {
    runRequest()
  }, 120000)
}

runRequest()
