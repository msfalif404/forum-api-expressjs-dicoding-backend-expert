const request = require('supertest');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');

describe('/authentications endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /authentications', () => {
    it('should response 201 and new authentication', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const server = await createServer(container);
      // add user
      await request(server)
        .post('/users')
        .send({
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        });

      // Action
      const response = await request(server)
        .post('/authentications')
        .send(requestPayload);

      // Assert
      expect(response.statusCode).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should response 400 if username not found', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const server = await createServer(container);

      // Action
      const response = await request(server)
        .post('/authentications')
        .send(requestPayload);

      // Assert
      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('username tidak ditemukan');
    });

    it('should response 401 if password wrong', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'wrong_password',
      };
      const server = await createServer(container);
      // Add user
      await request(server)
        .post('/users')
        .send({
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        });

      // Action
      const response = await request(server)
        .post('/authentications')
        .send(requestPayload);

      // Assert
      expect(response.statusCode).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('kredensial yang Anda masukkan salah');
    });

    it('should response 400 if login payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
      };
      const server = await createServer(container);

      // Action
      const response = await request(server)
        .post('/authentications')
        .send(requestPayload);

      // Assert
      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('harus mengirimkan username dan password');
    });

    it('should response 400 if login payload wrong data type', async () => {
      // Arrange
      const requestPayload = {
        username: 123,
        password: 'secret',
      };
      const server = await createServer(container);

      // Action
      const response = await request(server)
        .post('/authentications')
        .send(requestPayload);

      // Assert
      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('username dan password harus string');
    });
  });

  describe('when PUT /authentications', () => {
    it('should return 200 and new access token', async () => {
      // Arrange
      const server = await createServer(container);
      // add user
      await request(server)
        .post('/users')
        .send({
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        });
      // login user
      const loginResponse = await request(server)
        .post('/authentications')
        .send({
          username: 'dicoding',
          password: 'secret',
        });
      const { refreshToken } = loginResponse.body.data;

      // Action
      const response = await request(server)
        .put('/authentications')
        .send({
          refreshToken,
        });

      expect(response.statusCode).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return 400 payload not contain refresh token', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await request(server)
        .put('/authentications')
        .send({});

      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('harus mengirimkan token refresh');
    });

    it('should return 400 if refresh token not string', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await request(server)
        .put('/authentications')
        .send({
          refreshToken: 123,
        });

      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token harus string');
    });

    it('should return 400 if refresh token not valid', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await request(server)
        .put('/authentications')
        .send({
          refreshToken: 'invalid_refresh_token',
        });

      // Assert
      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token tidak valid');
    });

    it('should return 400 if refresh token not registered in database', async () => {
      // Arrange
      const server = await createServer(container);
      const refreshToken = await container.getInstance(AuthenticationTokenManager.name).createRefreshToken({ username: 'dicoding' });

      // Action
      const response = await request(server)
        .put('/authentications')
        .send({
          refreshToken,
        });

      // Assert
      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token tidak ditemukan di database');
    });
  });

  describe('when DELETE /authentications', () => {
    it('should response 200 if refresh token valid', async () => {
      // Arrange
      const server = await createServer(container);
      const refreshToken = 'refresh_token';
      await AuthenticationsTableTestHelper.addToken(refreshToken);

      // Action
      const response = await request(server)
        .delete('/authentications')
        .send({
          refreshToken,
        });

      // Assert
      expect(response.statusCode).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 400 if refresh token not registered in database', async () => {
      // Arrange
      const server = await createServer(container);
      const refreshToken = 'refresh_token';

      // Action
      const response = await request(server)
        .delete('/authentications')
        .send({
          refreshToken,
        });

      // Assert
      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token tidak ditemukan di database');
    });

    it('should response 400 if payload not contain refresh token', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await request(server)
        .delete('/authentications')
        .send({});

      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('harus mengirimkan token refresh');
    });

    it('should response 400 if refresh token not string', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await request(server)
        .delete('/authentications')
        .send({
          refreshToken: 123,
        });

      // Assert
      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token harus string');
    });
  });
});
