require('dotenv').config();
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

(async () => {
    const server = await createServer(container);
    const runningServer = await server.start();
    console.log(`server start at ${server.info.uri}`);
})();
