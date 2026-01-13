const express = require('express');
const AuthenticationsHandler = require('./handler');

const routes = (container) => {
    const router = express.Router();
    const handler = new AuthenticationsHandler(container);

    router.post('/', handler.postAuthenticationHandler);
    router.put('/', handler.putAuthenticationHandler);
    router.delete('/', handler.deleteAuthenticationHandler);

    return router;
};

module.exports = routes;
