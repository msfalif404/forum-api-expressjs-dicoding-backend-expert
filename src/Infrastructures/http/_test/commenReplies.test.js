const request = require('supertest');
const pool = require('../../database/postgres/pool');
const CommentRepliesTableTestHelper = require('../../../../tests/CommentRepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  // Pre-requisite payload

  const commentPayload = {
    content: 'This is comment',
  };

  const threadPayload = {
    title: 'First Thread',
    body: 'This is first thread',
  };

  const userPayload = {
    username: 'dicoding',
    password: 'secret',
    fullname: 'Dicoding Indonesia',
  };

  const notOwnerPayload = {
    username: 'ichsan',
    password: 'secret',
    fullname: 'Ichsan Sandy',
  };

  const loginPayload = {
    username: 'dicoding',
    password: 'secret',
  };

  const notOwnerLoginPayload = {
    username: 'ichsan',
    password: 'secret',
  };

  const requestPayload = {
    content: 'This is reply',
  };

  afterEach(async () => {
    await CommentRepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /replies', () => {
    it('should response 201 and return correct added comment reply', async () => {
      // Arrange
      const server = await createServer(container);

      // Add account
      await request(server).post('/users').send(userPayload);
      // login
      const auth = await request(server).post('/authentications').send(loginPayload);
      const authToken = auth.body.data.accessToken;

      // add thread
      const thread = await request(server)
        .post('/threads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(threadPayload);
      const threadId = thread.body.data.addedThread.id;

      // add comment
      const comment = await request(server)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentPayload);
      const commentId = comment.body.data.addedComment.id;

      // Action
      const response = await request(server)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestPayload);

      //Assert
      expect(response.statusCode).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedReply).toBeDefined();
    });
  });

  describe('when delete /replies/{commentReplyId}', () => {
    it('should response 200 with status success', async () => {
      // Arrange
      const server = await createServer(container);

      // Add account
      await request(server).post('/users').send(userPayload);
      // login
      const auth = await request(server).post('/authentications').send(loginPayload);
      const authToken = auth.body.data.accessToken;

      // add thread
      const thread = await request(server)
        .post('/threads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(threadPayload);
      const threadId = thread.body.data.addedThread.id;

      // add comment
      const comment = await request(server)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentPayload);
      const commentId = comment.body.data.addedComment.id;

      // add comment replies
      const commentReply = await request(server)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestPayload);
      const commentReplyId = commentReply.body.data.addedReply.id;

      // Action
      const response = await request(server)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${commentReplyId}`)
        .set('Authorization', `Bearer ${authToken}`);

      //Assert
      expect(response.statusCode).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should throw 403 if user not the owner', async () => {
      // Arrange
      const server = await createServer(container);

      // Add account
      await request(server).post('/users').send(userPayload);
      await request(server).post('/users').send(notOwnerPayload);

      // login
      const authOwner = await request(server).post('/authentications').send(loginPayload);
      const authNotOwner = await request(server).post('/authentications').send(notOwnerLoginPayload);

      const ownerToken = authOwner.body.data.accessToken;
      const notOwnerToken = authNotOwner.body.data.accessToken;

      // add thread
      const thread = await request(server)
        .post('/threads')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(threadPayload);
      const threadId = thread.body.data.addedThread.id;

      // add comment
      const commentAdded = await request(server)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(commentPayload);
      const commentId = commentAdded.body.data.addedComment.id;

      // add comment replies
      const commentReply = await request(server)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(requestPayload);
      const commentReplyId = commentReply.body.data.addedReply.id;

      // Action && Assert
      const response = await request(server)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${commentReplyId}`)
        .set('Authorization', `Bearer ${notOwnerToken}`);

      expect(response.statusCode).toEqual(403);
      expect(response.body.status).toEqual('fail');
    });
  });
});
