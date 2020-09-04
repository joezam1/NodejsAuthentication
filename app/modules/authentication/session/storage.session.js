const dbConnection = require('../../databases/mysql/db.connection.js');
const sessionConnection = dbConnection.getConnection();
const logger = require('../../data.recording/logger.js');

const TWENTYFOUR_HOURS = 1000 * 60 * 60 * 24;
const THREE_HOURS = 1000 * 60 * 60 * 3;
const FIFTEEN_MINUTES = 1000 * 60 * 15;
const FIVE_MINUTES = 1000 * 60 * 5;
const THREE_MINUTES = 1000 * 60 * 3;
const ONE_MINUTE = 1000 * 60 * 3;

const sessionStoreOptionsBasicOriginal = {
    expiration: 10800000,
    createDatabaseTable: true,
    schema: {
        tableName: 'users_sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}
//NOTE:With Expiration and expiration interval and Clear expired
// Whether or not to automatically check for and clear expired sessions:
//clearExpired: true,
// How frequently expired sessions will be cleared; milliseconds:
//checkExpirationInterval: 900000, --> 15 minutes
// The maximum age of a valid session; milliseconds:
//expiration: 86400000, --> 24 HS

const sessionStoreOptionsExpiration = {
    expiration: THREE_HOURS,
    clearExpired: true,
    checkExpirationInterval: ONE_MINUTE,
    createDatabaseTable: true,
    schema: {
        tableName: 'users_sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}

var storageSession = function(session) {   
    var MySQLStore = require('express-mysql-session')(session);
    var sessionStore = new MySQLStore(sessionStoreOptionsExpiration, sessionConnection);
    logger.resolveLog('sessionStore-triggered:',sessionStore);

    return sessionStore;
}

module.exports = storageSession;