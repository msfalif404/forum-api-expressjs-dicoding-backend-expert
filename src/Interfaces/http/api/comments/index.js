const express = require('express');
const CommentHandler = require('./handler');
const authMiddleware = require('../../middleware/auth');

const routes = (container) => {
    const router = express.Router();
    const handler = new CommentHandler(container);

    // Note: These routes are mounted under /threads in createServer.js
    // So the paths are relative to /threads
    // Expecting: /threads/{threadId}/comments

    // Actually, express router mergeParams might be needed if we mount it like app.use('/threads', commentsRouter)
    // But wait, if we look at createServer.js:
    // app.use('/threads', comments(container));
    // The path coming here matches /:threadId/comments...

    router.post('/:threadId/comments', authMiddleware, handler.postCommentHandler);
    router.delete('/:threadId/comments/:commentId', authMiddleware, handler.deleteCommentHandler);

    return router;
};

module.exports = routes;
