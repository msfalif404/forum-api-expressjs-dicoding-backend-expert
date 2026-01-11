const NewComment = require('../../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository, userRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload, useCaseThreadId, useCaseCredential) {
    // Validate inputs
    if (!useCaseThreadId || !useCaseCredential) {
      throw new Error('ADD_COMMENT.MISSING_REQUIRED_PARAMETERS');
    }

    const { content } = new NewComment(useCasePayload);
    
    // Verify thread and user exist in parallel
    const [thread, user] = await Promise.all([
      this._threadRepository.getThreadById(useCaseThreadId),
      this._userRepository.getUserById(useCaseCredential),
    ]);

    return await this._commentRepository.addComment(content, thread.id, user.id);
  }
}

module.exports = AddCommentUseCase;