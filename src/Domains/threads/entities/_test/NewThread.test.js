const NewThread = require('../NewThread');

describe('a NewThread entities', () => {
  it('should throw error when payload did not contain right property', () => {
    // Arrange
    const payload = {
      title: 'something',
      content: 'something',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload contain wrong data type', () => {
    // Arrange
    const payload = {
      title: 'something',
      body: 123,
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.PROPERTY_HAVE_WRONG_DATA_TYPE');
  });

  it('should throw error if the title more than 50 character', () => {
    const payload = {
      title:
        'something longer than 50 character and it really hard to have such an error and you did not find it in your last code',
      body: 'this is body',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.TITLE_EXCEED_CHAR_LIMIT');
  });

  it('should throw error when payload is null or not an object', () => {
    // Action and Assert
    expect(() => new NewThread(null)).toThrowError('NEW_THREAD.INVALID_PAYLOAD');
    expect(() => new NewThread('string')).toThrowError('NEW_THREAD.INVALID_PAYLOAD');
  });

  it('should throw error when title or body is empty string', () => {
    // Arrange
    const payload1 = {
      title: '   ',
      body: 'this is body',
    };
    const payload2 = {
      title: 'this is title',
      body: '   ',
    };

    // Action and Assert
    expect(() => new NewThread(payload1)).toThrowError('NEW_THREAD.CANNOT_BE_EMPTY_STRING');
    expect(() => new NewThread(payload2)).toThrowError('NEW_THREAD.CANNOT_BE_EMPTY_STRING');
  });

  it('should throw error if the body more than 1000 character', () => {
    const payload = {
      title: 'this is title',
      body: 'a'.repeat(1001),
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.BODY_EXCEED_CHAR_LIMIT');
  });

  it('should create NewThread object correctly', () => {
    // Arrange
    const payload = {
      title: '  this is title  ',
      body: '  this is body  ',
    };

    // Action
    const newThread = new NewThread(payload);

    // Assert
    expect(newThread.title).toEqual('this is title');
    expect(newThread.body).toEqual('this is body');
  });
});
