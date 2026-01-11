const CommentReplyRepository = require('../../../../Domains/comment_replies/CommentReplyRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const UserRepository = require('../../../../Domains/users/UserRepository');

const ThreadDetails = require('../../../../Domains/threads/entities/ThreadDetails');
const CommentDetails = require('../../../../Domains/comments/entities/CommentDetails');
const CommentReplyDetails = require('../../../../Domains/comment_replies/entities/CommentReplyDetails');

const GetDetailsThreadUseCase = require('../GetDetailsThreadUseCase');

describe('GetDetailsThreadUseCase', () => {
  /**
   * Testing the get thread details use case
   * can orchestra step by step
   * for adding the new thread details correctly
   */
  it('should orchestrating get the details thread', async () => {
    // Arrange
    const userArnold = {
      id: 'user-111',
      username: 'Arnold Szechuan',
    };

    const userDhh = {
      id: 'user-222',
      username: 'DHH',
    };

    const mockThreadData = {
      id: 'thread-123',
      title: 'this is title thread',
      body: 'this is body',
      created_at: '2023-07-18 20:38:31.448',
      user_id: 'user-111',
    };

    const commentData = [
      {
        id: 'comment-123',
        content: 'this is first',
        created_at: '2023-08-17 20:38:31.448',
        user_id: 'user-111',
        thread_id: 'thread-123',
        is_delete: false,
      },
      {
        id: 'comment-222',
        content: 'this is second without reply',
        created_at: '2023-08-17 20:38:31.448',
        user_id: 'user-111',
        thread_id: 'thread-123',
        is_delete: false,
      },
      {
        id: 'comment-333',
        content: 'this is deleted comment',
        created_at: '2023-08-17 20:38:31.448',
        user_id: 'user-111',
        thread_id: 'thread-123',
        is_delete: true,
      },
    ];

    const replyData = [
      {
        id: 'reply-123',
        content: 'this is first reply',
        created_at: '2023-08-18 20:38:31.448',
        user_id: 'user-222',
        comment_id: 'comment-123',
        is_delete: false,
      },
      {
        id: 'reply-124',
        content: 'this is deleted reply',
        created_at: '2023-08-18 20:38:31.448',
        user_id: 'user-111',
        comment_id: 'comment-123',
        is_delete: true,
      },
    ];

    /** creting dependency of use case */
    const mockCommentReplyRepository = new CommentReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(mockThreadData));
    mockUserRepository.getUserById = jest.fn().mockImplementation((userId) => {
      if (userId === 'user-111') {
        return Promise.resolve(userArnold);
      }
      if (userId === 'user-222') {
        return Promise.resolve(userDhh);
      }
    });
    mockCommentRepository.getCommentByThreadId = jest.fn().mockImplementation(() => Promise.resolve(commentData));


    // Mock batch methods
    mockUserRepository.getUsersByIds = jest.fn().mockImplementation((userIds) => {
      const users = [];
      userIds.forEach(userId => {
        if (userId === 'user-111') users.push(userArnold);
        if (userId === 'user-222') users.push(userDhh);
      });
      return Promise.resolve(users);
    });

    mockCommentReplyRepository.getCommentRepliesByCommentIds = jest.fn().mockImplementation((commentIds) => {
      if (commentIds.includes('comment-123')) {
        return Promise.resolve(replyData);
      }
      return Promise.resolve([]);
    });

    /** create use case instance */
    const getDetailsThreadUseCase = new GetDetailsThreadUseCase({
      commentReplyRepository: mockCommentReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const threadDetails = await getDetailsThreadUseCase.execute('thread-123');

    // Assert ThreadDetails properties
    expect(threadDetails.id).toBe('thread-123');
    expect(threadDetails.title).toBe('this is title thread');
    expect(threadDetails.body).toBe('this is body');
    expect(threadDetails.date).toBe('2023-07-18 20:38:31.448');
    expect(threadDetails.username).toBe('Arnold Szechuan');
    expect(threadDetails.comments).toHaveLength(3);

    // Assert first comment (with replies)
    expect(threadDetails.comments[0].id).toBe('comment-123');
    expect(threadDetails.comments[0].content).toBe('this is first');
    expect(threadDetails.comments[0].date).toBe('2023-08-17 20:38:31.448');
    expect(threadDetails.comments[0].username).toBe('Arnold Szechuan');
    expect(threadDetails.comments[0].replies).toHaveLength(2);

    // Assert first reply
    expect(threadDetails.comments[0].replies[0].id).toBe('reply-123');
    expect(threadDetails.comments[0].replies[0].content).toBe('this is first reply');
    expect(threadDetails.comments[0].replies[0].date).toBe('2023-08-18 20:38:31.448');
    expect(threadDetails.comments[0].replies[0].username).toBe('DHH');

    // Assert second reply (deleted)
    expect(threadDetails.comments[0].replies[1].id).toBe('reply-124');
    expect(threadDetails.comments[0].replies[1].content).toBe('**balasan telah dihapus**');
    expect(threadDetails.comments[0].replies[1].date).toBe('2023-08-18 20:38:31.448');
    expect(threadDetails.comments[0].replies[1].username).toBe('Arnold Szechuan');

    // Assert second comment (no replies)
    expect(threadDetails.comments[1].id).toBe('comment-222');
    expect(threadDetails.comments[1].content).toBe('this is second without reply');
    expect(threadDetails.comments[1].date).toBe('2023-08-17 20:38:31.448');
    expect(threadDetails.comments[1].username).toBe('Arnold Szechuan');
    expect(threadDetails.comments[1].replies).toHaveLength(0);

    // Assert third comment (deleted)
    expect(threadDetails.comments[2].id).toBe('comment-333');
    expect(threadDetails.comments[2].content).toBe('**komentar telah dihapus**');
    expect(threadDetails.comments[2].date).toBe('2023-08-17 20:38:31.448');
    expect(threadDetails.comments[2].username).toBe('Arnold Szechuan');
    expect(threadDetails.comments[2].replies).toHaveLength(0);
  });
  it('should handle additional users when replies have different users', async () => {
    // Arrange
    const userArnold = {
      id: 'user-111',
      username: 'Arnold Szechuan',
    };

    const userDhh = {
      id: 'user-222',
      username: 'DHH',
    };

    const userExtra = {
      id: 'user-333',
      username: 'Extra User',
    };

    const mockThreadData = {
      id: 'thread-123',
      title: 'this is title thread',
      body: 'this is body',
      created_at: '2023-07-18 20:38:31.448',
      user_id: 'user-111',
    };

    const commentData = [
      {
        id: 'comment-123',
        content: 'this is first',
        created_at: '2023-08-17 20:38:31.448',
        user_id: 'user-111',
        thread_id: 'thread-123',
      },
    ];

    const replyData = [
      {
        id: 'reply-123',
        content: 'this is first reply',
        created_at: '2023-08-18 20:38:31.448',
        user_id: 'user-333', // Different user not in comment users
        comment_id: 'comment-123',
      },
    ];

    /** creting dependency of use case */
    const mockCommentReplyRepository = new CommentReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(mockThreadData));
    mockUserRepository.getUserById = jest.fn().mockImplementation(() => Promise.resolve(userArnold));
    mockCommentRepository.getCommentByThreadId = jest.fn().mockImplementation(() => Promise.resolve(commentData));

    // Mock batch methods
    mockUserRepository.getUsersByIds = jest.fn()
      .mockImplementationOnce(() => Promise.resolve([userArnold])) // First call for comment users
      .mockImplementationOnce(() => Promise.resolve([userExtra])); // Second call for additional users

    mockCommentReplyRepository.getCommentRepliesByCommentIds = jest.fn().mockImplementation(() => Promise.resolve(replyData));

    /** create use case instance */
    const getDetailsThreadUseCase = new GetDetailsThreadUseCase({
      commentReplyRepository: mockCommentReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const threadDetails = await getDetailsThreadUseCase.execute('thread-123');

    // Assert ThreadDetails properties
    expect(threadDetails.id).toBe('thread-123');
    expect(threadDetails.title).toBe('this is title thread');
    expect(threadDetails.body).toBe('this is body');
    expect(threadDetails.date).toBe('2023-07-18 20:38:31.448');
    expect(threadDetails.username).toBe('Arnold Szechuan');
    expect(threadDetails.comments).toHaveLength(1);

    // Assert comment properties
    expect(threadDetails.comments[0].id).toBe('comment-123');
    expect(threadDetails.comments[0].content).toBe('this is first');
    expect(threadDetails.comments[0].date).toBe('2023-08-17 20:38:31.448');
    expect(threadDetails.comments[0].username).toBe('Arnold Szechuan');
    expect(threadDetails.comments[0].replies).toHaveLength(1);

    // Assert reply properties
    expect(threadDetails.comments[0].replies[0].id).toBe('reply-123');
    expect(threadDetails.comments[0].replies[0].content).toBe('this is first reply');
    expect(threadDetails.comments[0].replies[0].date).toBe('2023-08-18 20:38:31.448');
    expect(threadDetails.comments[0].replies[0].username).toBe('Extra User');

    expect(mockUserRepository.getUsersByIds).toHaveBeenCalledTimes(2);
  });

  it('should orchestrating get the details thread if there no comment', async () => {
    // Arrange
    const userArnold = {
      id: 'user-111',
      username: 'Arnold Szechuan',
    };

    const userDhh = {
      id: 'user-222',
      username: 'DHH',
    };

    const mockThreadData = {
      id: 'thread-123',
      title: 'this is title thread',
      body: 'this is body',
      created_at: '2023-07-18 20:38:31.448',
      user_id: 'user-111',
    };

    const commentData = [];

    /** creting dependency of use case */
    const mockCommentReplyRepository = new CommentReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(mockThreadData));
    mockUserRepository.getUserById = jest.fn().mockImplementation((userId) => {
      if (userId === 'user-111') {
        return Promise.resolve(userArnold);
      }
      if (userId === 'user-222') {
        return Promise.resolve(userDhh);
      }
    });
    mockCommentRepository.getCommentByThreadId = jest.fn().mockImplementation(() => Promise.resolve(commentData));

    /** create use case instance */
    const getDetailsThreadUseCase = new GetDetailsThreadUseCase({
      commentReplyRepository: mockCommentReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const threadDetails = await getDetailsThreadUseCase.execute('thread-123');

    // Assert ThreadDetails properties
    expect(threadDetails.id).toBe('thread-123');
    expect(threadDetails.title).toBe('this is title thread');
    expect(threadDetails.body).toBe('this is body');
    expect(threadDetails.date).toBe('2023-07-18 20:38:31.448');
    expect(threadDetails.username).toBe('Arnold Szechuan');
    expect(threadDetails.comments).toHaveLength(0);
  });

  it('should handle empty additional users when no new users in replies', async () => {
    // Arrange
    const userArnold = {
      id: 'user-111',
      username: 'Arnold Szechuan',
    };

    const mockThreadData = {
      id: 'thread-123',
      title: 'this is title thread',
      body: 'this is body',
      created_at: '2023-07-18 20:38:31.448',
      user_id: 'user-111',
    };

    const commentData = [
      {
        id: 'comment-123',
        content: 'this is first',
        created_at: '2023-08-17 20:38:31.448',
        user_id: 'user-111',
        thread_id: 'thread-123',
      },
    ];

    const replyData = [
      {
        id: 'reply-123',
        content: 'this is first reply',
        created_at: '2023-08-18 20:38:31.448',
        user_id: 'user-111', // Same user as comment
        comment_id: 'comment-123',
      },
    ];

    /** creting dependency of use case */
    const mockCommentReplyRepository = new CommentReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(mockThreadData));
    mockUserRepository.getUserById = jest.fn().mockImplementation(() => Promise.resolve(userArnold));
    mockCommentRepository.getCommentByThreadId = jest.fn().mockImplementation(() => Promise.resolve(commentData));

    // Mock batch methods - only one call expected since no additional users
    mockUserRepository.getUsersByIds = jest.fn().mockImplementation(() => Promise.resolve([userArnold]));
    mockCommentReplyRepository.getCommentRepliesByCommentIds = jest.fn().mockImplementation(() => Promise.resolve(replyData));

    /** create use case instance */
    const getDetailsThreadUseCase = new GetDetailsThreadUseCase({
      commentReplyRepository: mockCommentReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const threadDetails = await getDetailsThreadUseCase.execute('thread-123');

    // Assert ThreadDetails properties
    expect(threadDetails.id).toBe('thread-123');
    expect(threadDetails.title).toBe('this is title thread');
    expect(threadDetails.body).toBe('this is body');
    expect(threadDetails.date).toBe('2023-07-18 20:38:31.448');
    expect(threadDetails.username).toBe('Arnold Szechuan');
    expect(threadDetails.comments).toHaveLength(1);

    // Assert comment properties
    expect(threadDetails.comments[0].id).toBe('comment-123');
    expect(threadDetails.comments[0].content).toBe('this is first');
    expect(threadDetails.comments[0].date).toBe('2023-08-17 20:38:31.448');
    expect(threadDetails.comments[0].username).toBe('Arnold Szechuan');
    expect(threadDetails.comments[0].replies).toHaveLength(1);

    // Assert reply properties
    expect(threadDetails.comments[0].replies[0].id).toBe('reply-123');
    expect(threadDetails.comments[0].replies[0].content).toBe('this is first reply');
    expect(threadDetails.comments[0].replies[0].date).toBe('2023-08-18 20:38:31.448');
    expect(threadDetails.comments[0].replies[0].username).toBe('Arnold Szechuan');

    expect(mockUserRepository.getUsersByIds).toHaveBeenCalledTimes(1); // Only called once
  });
});
