const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const CommentDetails = require('../../../Domains/comments/entities/CommentDetails');
const CommentReplyDetails = require('../../../Domains/comment_replies/entities/CommentReplyDetails');

class GetDetailsThreadUseCase {
  constructor({ userRepository, threadRepository, commentRepository, commentReplyRepository }) {
    this._userRepository = userRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentReplyRepository = commentReplyRepository;
  }

  async execute(useCaseThreadId) {
    // Get thread and verify it exists
    const threadFromDb = await this._threadRepository.getThreadById(useCaseThreadId);

    // Get all data in parallel to avoid N+1 queries
    const [
      threadUser,
      commentsInThread,
    ] = await Promise.all([
      this._userRepository.getUserById(threadFromDb.user_id),
      this._commentRepository.getCommentByThreadId(threadFromDb.id),
    ]);

    // If no comments, return early
    if (commentsInThread.length === 0) {
      return new ThreadDetails({
        id: threadFromDb.id,
        title: threadFromDb.title,
        body: threadFromDb.body,
        date: threadFromDb.created_at.toString(),
        username: threadUser.username,
        comments: [],
      });
    }

    // Get all unique user IDs and comment IDs
    const commentIds = commentsInThread.map(comment => comment.id);
    const userIds = [...new Set(commentsInThread.map(comment => comment.user_id))];

    // Fetch all users and replies in parallel
    const [users, allReplies] = await Promise.all([
      this._userRepository.getUsersByIds(userIds),
      this._commentReplyRepository.getCommentRepliesByCommentIds(commentIds),
    ]);

    // Get unique reply user IDs
    const replyUserIds = [...new Set(allReplies.map(reply => reply.user_id))];
    const additionalUsers = replyUserIds.filter(id => !userIds.includes(id));

    // Fetch additional users if needed
    const additionalUsersData = additionalUsers.length > 0
      ? await this._userRepository.getUsersByIds(additionalUsers)
      : [];

    // Create user lookup map
    const userMap = new Map();
    [...users, ...additionalUsersData].forEach(user => {
      userMap.set(user.id, user);
    });

    // Group replies by comment ID
    const repliesByCommentId = allReplies.reduce((acc, reply) => {
      if (!acc[reply.comment_id]) acc[reply.comment_id] = [];
      acc[reply.comment_id].push(reply);
      return acc;
    }, {});

    // Build comments with replies
    const comments = commentsInThread.map(commentData => {
      const commentUser = userMap.get(commentData.user_id);
      const replies = (repliesByCommentId[commentData.id] || []).map(replyData => {
        const replyUser = userMap.get(replyData.user_id);
        return new CommentReplyDetails({
          id: replyData.id,
          content: replyData.is_delete ? '**balasan telah dihapus**' : replyData.content,
          date: replyData.created_at.toString(),
          username: replyUser.username,
        });
      });

      return new CommentDetails({
        id: commentData.id,
        content: commentData.is_delete ? '**komentar telah dihapus**' : commentData.content,
        date: commentData.created_at.toString(),
        username: commentUser.username,
        replies,
      });
    });

    return new ThreadDetails({
      id: threadFromDb.id,
      title: threadFromDb.title,
      body: threadFromDb.body,
      date: threadFromDb.created_at.toString(),
      username: threadUser.username,
      comments,
    });
  }
}

module.exports = GetDetailsThreadUseCase;