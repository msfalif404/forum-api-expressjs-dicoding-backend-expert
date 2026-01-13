const express = require('express');
const ThreadHandler = require('./handler');
const authMiddleware = require('../../middleware/auth');

const routes = (container) => {
    const router = express.Router();
    const handler = new ThreadHandler(container);

    router.post('/', authMiddleware, handler.postThreadHandler);
    router.get('/:threadId', handler.getThreadDetailsHandler);

    return router;
};

module.exports = routes;
