const mysql = require('mysql');
const mysqlDbConfig = require('./mysql.config.js')
const logger = require('../../data.recording/logger.js');

var mysqlConnection = null;

var newConnection = function() {
    var options = {
        host: mysqlDbConfig.HOST,
        user: mysqlDbConfig.USER,
        password: mysqlDbConfig.PASSWORD,
        database: mysqlDbConfig.DB,
        port: mysqlDbConfig.PORT
    }
    mysqlConnection = mysql.createConnection(options)

    mysqlConnection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }
        logger.resolveLog('connected as id ' + mysqlConnection.threadId);
    });
    return mysqlConnection;
}

var getConnection = function() {
    var connect = null
    if (mysqlConnection === null || mysqlConnection.state === 'disconnected') {
        connect = newConnection();
    } else {
        connect = mysqlConnection;
    }
    return connect;
}

var mysqlDbConnection = {
    newConnection: newConnection,
    getConnection: getConnection
}
module.exports = mysqlDbConnection;