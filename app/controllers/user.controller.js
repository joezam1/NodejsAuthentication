var sqlStatement = require('../modules/databases/mysql/queries/generic.js');
var database = require('../modules/databases/mysql/database.actions.js');
var userModel = require('../models/user.model.js');
var jwtCommon = require('../modules/authentication/jwt/jwt.common.js');
var jwtConfig = require('../modules/authentication/jwt/jwt.config.js');
var input = require('../library/input.common.js');
const responseNotification = require('../library/response.notification.js');
const logger = require('../modules/data.recording/logger.js');


var users = function(app) {

    //route CREATE
    //route READ - allUsers -
    app.get('/api/users', async (request, response) => {

        var user = new userModel();
        var sqlGetAllUsers = sqlStatement.selectAll(user.tblName);
        await database.query(sqlGetAllUsers)

        .then(function(result) {
            if (result === undefined || result === null) return;

            var users = [{ "result": result }]
            responseNotification(request,response, 200, 'OK', 'All registered Users', users);
        })
    });

    //route READ - SingleUser '/api/user?userId=3'
    app.get('/api/user', async (request, response) => {
        logger.resolveLog(request.query.userId);
        var verifiedToken = getProcessedAccessToken(request, response);
        if(!input.isValid(verifiedToken)){
            return null;
        }
        var userIdIsZero = (request.query.userId === 0||request.query.userId === '0')
        var userIdIsEmpty = request.query.userId ==='';
        var userId = (userIdIsZero || userIdIsEmpty)? verifiedToken.id: request.query.userId;
        var user = new userModel();
        var sqlGetSingleUser = sqlStatement.selectWhere(user.tblName, user.tblCol.id);
        await database.query(sqlGetSingleUser,[userId])

        .then(function(result) {
            if(!input.isValid(result)){return null; }
            var users = [{ "result": result }]
            responseNotification(request, response, 200, 'OK', 'selected registered User', users);
        })
    });

    //route UPDATE

    //route DELETE

}

module.exports = users;

//#region Private Methods
function getProcessedAccessToken(request, response){

    var accessToken = jwtCommon.getAccessToken(request);
    var tokenInfoObj = jwtCommon.getDecodedJwtTokenPayload(accessToken,jwtConfig.accessTokenSecret);
    var selectedTokenIsVerified = jwtCommon.isDecodedTokenValid(tokenInfoObj);
    if (!selectedTokenIsVerified) {
        var redirectAction = [{ 'redirectTo': '/auth/logout' }, errorObj];  
        responseNotification(request, response, 500, 'ERROR', 'Token is not valid. There is an error', redirectAction);

        return null;
    }
    return tokenInfoObj.payload;
}
//#endRegion Private Methods