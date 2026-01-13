const AddCommentUseCase = require('../../../../Applications/use_case/comments/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/comments/DeleteCommentUseCase');

class CommentHandler {
    constructor(container) {
        this._container = container;
        this.postCommentHandler = this.postCommentHandler.bind(this);
        this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    }

    async postCommentHandler(req, res, next) {
        try {
            const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
            const { id: ownerId } = req.auth.credentials;
            const { threadId } = req.params;
            const addedComment = await addCommentUseCase.execute(req.body, threadId, ownerId);

            res.status(201).json({
                status: 'success',
                data: {
                    addedComment,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteCommentHandler(req, res, next) {
        try {
            const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
            const { id: credentialId } = req.auth.credentials;
            const { threadId, commentId } = req.params;

            await deleteCommentUseCase.execute(commentId, threadId, credentialId);

            res.json({
                status: 'success',
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CommentHandler;
