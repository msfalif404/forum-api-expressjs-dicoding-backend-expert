const AddCommentReplyUseCase = require('../../../../Applications/use_case/comment_replies/AddCommentReplyUseCase');
const DeleteCommentReplyUseCase = require('../../../../Applications/use_case/comment_replies/DeleteCommentReplyUseCase');

class CommentReplyHandler {
    constructor(container) {
        this._container = container;
        this.postCommentReplyHandler = this.postCommentReplyHandler.bind(this);
        this.deleteCommentReplyHandler = this.deleteCommentReplyHandler.bind(this);
    }

    async postCommentReplyHandler(req, res, next) {
        try {
            const addCommentReplyUseCase = this._container.getInstance(AddCommentReplyUseCase.name);
            const { id: ownerId } = req.auth.credentials;
            const { threadId, commentId } = req.params;
            const addedCommentReply = await addCommentReplyUseCase.execute(req.body, threadId, commentId, ownerId);

            res.status(201).json({
                status: 'success',
                data: {
                    addedReply: addedCommentReply,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteCommentReplyHandler(req, res, next) {
        try {
            const deleteCommentReplyUseCase = this._container.getInstance(DeleteCommentReplyUseCase.name);
            const { id: credentialId } = req.auth.credentials;
            const { threadId, commentId, commentReplyId } = req.params;

            await deleteCommentReplyUseCase.execute(commentReplyId, threadId, commentId, credentialId);

            res.json({
                status: 'success',
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CommentReplyHandler;
