require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Interfaces
const users = require('../../Interfaces/http/api/users');
const authentications = require('../../Interfaces/http/api/authentications');
const threads = require('../../Interfaces/http/api/threads');
const comments = require('../../Interfaces/http/api/comments');
const comment_replies = require('../../Interfaces/http/api/comment_replies');

// Exceptions
const ClientError = require('../../Commons/exceptions/ClientError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');

const createServer = async (container) => {
    const app = express();
    const port = process.env.PORT || 5000;
    const host = process.env.HOST || 'localhost';

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Register Routes
    app.use('/users', users(container));
    app.use('/authentications', authentications(container));
    app.use('/threads', threads(container));
    app.use('/threads', comments(container)); // Comments are nested under threads
    app.use('/threads', comment_replies(container)); // Replies are nested under threads

    app.get('/', (req, res) => {
        res.json({
            value: 'Hello world!',
        });
    });

    // Error Handling Middleware
    app.use((error, req, res, next) => {
        const translatedError = DomainErrorTranslator.translate(error);

        if (translatedError instanceof ClientError) {
            return res.status(translatedError.statusCode).json({
                status: 'fail',
                message: translatedError.message,
            });
        }



        console.log(error);
        return res.status(500).json({
            status: 'error',
            message: 'terjadi kegagalan pada server kami',
        });
    });

    // Add a start method to match the Hapi interface for app.js convenience
    app.start = async () => {
        return new Promise((resolve) => {
            const server = app.listen(port, host, () => {
                app.info = { uri: `http://${host}:${port}` };
                resolve(server);
            });
        });
    };

    return app;
};

module.exports = createServer;
