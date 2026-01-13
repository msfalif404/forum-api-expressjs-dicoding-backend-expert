const express = require('express');
const CommentReplyHandler = require('./handler');
const authMiddleware = require('../../middleware/auth');

const routes = (container) => {
    const router = express.Router();
    const handler = new CommentReplyHandler(container);

    // Note: These routes are mounted under /threads in createServer.js
    router.post('/:threadId/comments/:commentId/replies', authMiddleware, handler.postCommentReplyHandler);
    router.delete('/:threadId/comments/:commentId/replies/:commentReplyId', authMiddleware, handler.deleteCommentReplyHandler);

    return router;
};

module.exports = routes;
