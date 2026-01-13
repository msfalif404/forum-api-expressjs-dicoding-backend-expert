const request = require('supertest');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and return correct added thread', async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: 'First Thread',
        body: 'This is first thread',
      };

      // Add account
      await request(server)
        .post('/users')
        .send({
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        });

      // login
      const auth = await request(server)
        .post('/authentications')
        .send({
          username: 'dicoding',
          password: 'secret',
        });

      const { accessToken } = auth.body.data;

      // Action
      const response = await request(server)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      //Assert
      expect(response.statusCode).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toBeDefined();
    });

    it('should response 401 if no authorization', async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: 'First Thread',
        body: 'This is first thread',
      };
      const accessToken = 'wrongtoken';

      // Action
      const response = await request(server)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      // 401 Unauthorized in our new middleware throws AuthenticationError which maps to 401
      expect(response.statusCode).toEqual(401);
      expect(response.body.message).toEqual('Invalid token');
    });

    it('should response 400 if bad payload', async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: 'First Thread',
      };
      // Add account
      await request(server)
        .post('/users')
        .send({
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        });

      // login
      const auth = await request(server)
        .post('/authentications')
        .send({
          username: 'dicoding',
          password: 'secret',
        });

      const { accessToken } = auth.body.data;

      // Action
      const response = await request(server)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('cannot make a new thread, payload not correct');
    });
  });

  describe('when GET /threads/{threadsId}', () => {
    it('it should display the right thread details', async () => {
      // Arrange
      const server = await createServer(container);

      // Add account
      await request(server)
        .post('/users')
        .send({
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        });
      // login
      const auth = await request(server)
        .post('/authentications')
        .send({
          username: 'dicoding',
          password: 'secret',
        });
      const authToken = auth.body.data.accessToken;

      // add thread
      const thread = await request(server)
        .post('/threads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'First Thread',
          body: 'This is first thread',
        });
      const threadId = thread.body.data.addedThread.id;

      // add comment
      const comment = await request(server)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is comment',
        });
      const commentId = comment.body.data.addedComment.id;

      // add comment replies
      await request(server)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is reply',
        });

      // Action
      const response = await request(server)
        .get(`/threads/${threadId}`);

      //Assert
      expect(response.statusCode).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread).toBeDefined();
    });
  });
});
