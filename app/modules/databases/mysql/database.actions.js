const logger = require('../../data.recording/logger.js');

var activeConnection = null;

function setNewConnection() {
    if (activeConnection === null || activeConnection.state === 'disconnected') {
        var connection = require('./db.connection.js');
        activeConnection = connection.newConnection();
    }
}

var dbQuery = function(sqlStatement, args) {
    setNewConnection();
    return new Promise(function(resolve, reject) {
        activeConnection.query(sqlStatement, args, function(error, rows) {
            logger.resolveLog('sqlStatement:', sqlStatement);
            logger.resolveLog('args', args);
            if (error) {
                console.log(error);
                return reject(error);
            }
            resolve(rows);
        });
    });
}

var dbClose = function() {
    return new Promise(function(resolve, reject) {
        activeConnection.end(function(error) {
            logger.resolveLog('connection closed:' + activeConnection);
            if (error) {
                return reject(error);
            }
            resolve();
        })
    });
}
var database = {
    query: dbQuery,
    close: dbClose,
}


module.exports = database;