const CommentDetails = require('../CommentDetails');

describe('a CommentDetails entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      username: 'dicoding',
      date: '2021-08-08T07:19:09.775Z',
      // replies missing
    };

    // Action and Assert
    expect(() => new CommentDetails(payload)).toThrowError('COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload property did not meet data type needed', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      username: 'dicoding',
      date: '2021-08-08T07:19:09.775Z',
      replies: {}, // Wrong type: Object, should be Array
    };

    // Action and Assert
    expect(() => new CommentDetails(payload)).toThrowError('COMMENT_DETAILS.PROPERTY_HAVE_WRONG_DATA_TYPE');
  });

  it('should throw error when payload property did not meet data type needed (primitive type)', () => {
    // Arrange
    const payload = {
      id: 123, // Wrong type: Number, should be String
      content: 'sebuah comment',
      username: 'dicoding',
      date: '2021-08-08T07:19:09.775Z',
      replies: [], 
    };

    // Action and Assert
    expect(() => new CommentDetails(payload)).toThrowError('COMMENT_DETAILS.PROPERTY_HAVE_WRONG_DATA_TYPE');
  });
  // -----------------------------

  it('should create CommentDetails object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      username: 'dicoding',
      date: '2021-08-08T07:19:09.775Z',
      replies: [],
    };

    // Action
    const commentDetails = new CommentDetails(payload);

    // Assert
    expect(commentDetails.id).toEqual(payload.id);
    expect(commentDetails.content).toEqual(payload.content);
    expect(commentDetails.username).toEqual(payload.username);
    expect(commentDetails.date).toEqual(payload.date);
    expect(commentDetails.replies).toEqual(payload.replies);
  });
});