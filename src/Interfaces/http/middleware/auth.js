const jwt = require('jsonwebtoken');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthenticationError = require('../../../Commons/exceptions/AuthenticationError');

const authMiddleware = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        throw new AuthenticationError('Missing authentication');
    }

    const token = authorization.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        req.auth = {
            credentials: {
                id: decoded.id
            }
        }
        next();
    } catch (error) {
        throw new AuthenticationError('Invalid token');
    }
};

module.exports = authMiddleware;
