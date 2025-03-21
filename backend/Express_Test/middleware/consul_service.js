const Consul = require('consul');
const consul = new Consul();

const serviceKey = "test_details-service"


// register expert service in consul discovery server
consul.agent.service.register({
    id:serviceKey,
    name:serviceKey,
    address:"localhost",
    port:8000
},
(err)=>{
    if(err)
        throw err;
    console.log('Test Service successfully registered')
})
// Gracefully deregister service when shutting down
process.on('SIGINT', async () => {
    try {
        await consul.agent.service.deregister('test_details-service');
        console.log('Beneficiary Service deregistered from Consul');
        process.exit();
    } catch (err) {
        console.error('Error deregistering service:', err);
        process.exit(1);
    }
});
module.exports = consul;

