const dbConnection = require('../../databases/mysql/db.connection.js');
const session = require('express-session');
const storageSessionDb = require('./storage.session.js');
const logger = require('../../data.recording/logger.js');

const sessionStore = storageSessionDb(session);
const sessionConfig = require('./session.config.js');

const IN_PROD = (sessionConfig.NODE_ENV === 'production')
const IN_DEV = (sessionConfig.NODE_ENV === 'development')

var userSession = async function(app) {
    logger.resolveLog('inside userSession');
    app.use(session({
        store: sessionStore,
        name: sessionConfig.SESSION_NAME,
        resave: false,
        saveUninitialized: false,
        secret: sessionConfig.SESSION_SECRET,
        cookie: {
            path: '/',
            maxAge: sessionConfig.SESSION_LIFETIME,
            sameSite: true,
            secure: IN_PROD,
        },
        rolling: true
    }));
}

module.exports = userSession;