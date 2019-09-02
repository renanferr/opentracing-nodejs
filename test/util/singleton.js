const Tracer = require('../../lib').Tracer
const serviceName = 'my-node-service-1'
const serverUrl = 'https://711874f7b2....apm.sa-east-1.aws.cloud.es.io:443'
const secretToken = 'T7VeFFYqRI1...'

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