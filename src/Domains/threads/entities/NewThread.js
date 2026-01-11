class NewThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { title, body } = payload;
    this.title = title.trim();
    this.body = body.trim();
  }

  _verifyPayload(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('NEW_THREAD.INVALID_PAYLOAD');
    }

    const { title, body } = payload;

    // Check required properties
    if (!title || !body) {
      throw new Error('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    // Check data types
    if (typeof title !== 'string' || typeof body !== 'string') {
      throw new Error('NEW_THREAD.PROPERTY_HAVE_WRONG_DATA_TYPE');
    }

    // Check for empty strings after trimming
    if (title.trim().length === 0 || body.trim().length === 0) {
      throw new Error('NEW_THREAD.CANNOT_BE_EMPTY_STRING');
    }

    // Check length limits
    if (title.trim().length > 50) {
      throw new Error('NEW_THREAD.TITLE_EXCEED_CHAR_LIMIT');
    }

    if (body.trim().length > 1000) {
      throw new Error('NEW_THREAD.BODY_EXCEED_CHAR_LIMIT');
    }
  }
}

module.exports = NewThread;