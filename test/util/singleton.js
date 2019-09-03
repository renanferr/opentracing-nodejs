const Tracer = require('../../lib').Tracer

const serviceName = 'apm-node-test'
const serverUrl = undefined
const secretToken = undefined

const tracer = new Tracer({
    secretToken,
    serverUrl,
    serviceName,
})

module.exports = {
    tracer,
    serviceName,
    serverUrl,
    secretToken
}