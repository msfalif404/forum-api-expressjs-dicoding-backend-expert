const AddThreadUseCase = require('../../../../Applications/use_case/threads/AddThreadUseCase');
const GetDetailsThreadUseCase = require('../../../../Applications/use_case/threads/GetDetailsThreadUseCase');

class ThreadHandler {
    constructor(container) {
        this._container = container;
        this.postThreadHandler = this.postThreadHandler.bind(this);
        this.getThreadDetailsHandler = this.getThreadDetailsHandler.bind(this);
    }

    async postThreadHandler(req, res, next) {
        try {
            const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
            const { id: userId } = req.auth.credentials;
            const addedThread = await addThreadUseCase.execute(req.body, userId);

            res.status(201).json({
                status: 'success',
                data: {
                    addedThread,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getThreadDetailsHandler(req, res, next) {
        try {
            const getDetailsThreadUseCase = this._container.getInstance(GetDetailsThreadUseCase.name);
            const { threadId } = req.params;
            const thread = await getDetailsThreadUseCase.execute(threadId);

            res.json({
                status: 'success',
                data: { thread },
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ThreadHandler;
