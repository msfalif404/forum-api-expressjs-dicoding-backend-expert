const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentReplyRepository = require('../../Domains/comment_replies/CommentReplyRepository');
const AddedCommentReply = require('../../Domains/comment_replies/entities/AddedCommentReply');

class CommentReplyRepositoryPostgres extends CommentReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addCommentReply(commentReplyContent, threadId, commentId, ownerId) {
    const id = `reply-${this._idGenerator()}`;
    const created_at = new Date();
    const is_delete = false;

    const query = {
      text: 'INSERT INTO comment_replies VALUES($1, $2, $3, $4, $5, $6, $7) Returning id, content, user_id',
      values: [id, commentReplyContent, created_at, ownerId, threadId, commentId, is_delete],
    };

    const result = await this._pool.query(query);

    return new AddedCommentReply({
      id: result.rows[0].id,
      content: result.rows[0].content,
      owner: result.rows[0].user_id,
    });
  }

  async getCommentReplyById(commentReplyId) {
    const query = {
      text: 'SELECT * FROM comment_replies WHERE id = $1',
      values: [commentReplyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment reply not found');
    }

    const comment = result.rows[0];

    return comment;
  }

  async getCommentReplyByCommentId(commentId) {
    const query = {
      text: 'SELECT * FROM comment_replies WHERE comment_id = $1 ORDER BY created_at ASC',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return [];
    }

    return result.rows;
  }

  async deleteCommentReply(commentReplyId, threadId, commentId, ownerId) {
    const query = {
      text: 'UPDATE comment_replies SET is_delete = true WHERE id = $1 AND thread_id = $2 AND user_id = $3 AND comment_id = $4 RETURNING id',
      values: [commentReplyId, threadId, ownerId, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('failed to delete comment');
    }
  }

  async getCommentRepliesByCommentIds(commentIds) {
    if (!commentIds || commentIds.length === 0) {
      return [];
    }

    const placeholders = commentIds.map((_, index) => `$${index + 1}`).join(', ');
    const query = {
      text: `SELECT * FROM comment_replies WHERE comment_id IN (${placeholders}) ORDER BY created_at ASC`,
      values: commentIds,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = CommentReplyRepositoryPostgres;
