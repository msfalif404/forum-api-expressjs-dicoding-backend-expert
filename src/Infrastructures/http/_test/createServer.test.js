const request = require('supertest');
const createServer = require('../createServer');

describe('HTTP server', () => {
  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const server = await createServer({});

    // Action
    const response = await request(server).get('/unregisteredRoute');

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const server = await createServer({}); // fake injection without real container causing error in users route which is good for 500 test

    // Action
    const response = await request(server)
      .post('/users')
      .send(requestPayload);

    // Assert
    // Expect 500 because container is empty and instantiation of handler fails or use case resolution fails
    expect(response.statusCode).toEqual(500);
    expect(response.body.status).toEqual('error');
    expect(response.body.message).toEqual('terjadi kegagalan pada server kami');
  });

  describe('when GET /', () => {
    it('should return 200 and hello world', async () => {
      // Arrange
      const server = await createServer({});
      // Action
      const response = await request(server).get('/');
      // Assert
      expect(response.statusCode).toEqual(200);
      expect(response.body.value).toEqual('Hello world!');
    });
  });
});
