const inputCommon = require('../library/input.common.js');
const responseNotification = require('../library/response.notification.js');
const jwtCommon = require('../modules/authentication/jwt/jwt.common.js');
const jwtConfig = require('../modules/authentication/jwt/jwt.config.js');
const routes = require('../modules/authorization/routes.js');
const userSessionModel = require('../models/user_session.model.js');
const sqlStatement = require('../modules/databases/mysql/queries/generic.js');
const database = require('../modules/databases/mysql/database.actions.js');
const logger = require('../modules/data.recording/logger.js');

    //NOTE:
    //if page request is public. ALL IS OK
    //if page request is private. Then 
    //Verify if user is trying to get a restricted resource then 
    //if user has not authorization RESPONSE 403 FORBIDDEN
    //Verify if user does have stored a sessionId. 
    //if user is not authenticated with session then RESPONSE 401 UNAUTHORIZED
    
const authRedirection = async function(request, response, next) {
    logger.resolveLog('BEGIN------------------------------------')
    var isPublicPage = requestPublicWebPage(request, next);
    if(isPublicPage) {return;}
   
    var userRequestIsAuthorized = jwtCommon.userIsAuthorized_notification(request, response,jwtConfig.accessTokenSecret);
    if (!userRequestIsAuthorized) { return; }

    sessionIsValid(request, response, next);
    logger.resolveLog('END--------------------------------------');
}

module.exports = authRedirection;

//#region private methods
function requestPublicWebPage(request, next){
    var path = request.path;
    var isPublic = routes.isRoutePublic(path)
    if(isPublic){  
        next(); 
        return true;
    }
    return false;
}

function sessionIsValid(request, response, next){
    logger.resolveLog('session BEGIN-------------');
    if(inputCommon.isValid(request.session)){
        //we check if the sessionID is stored in the database
        var userSessionReq = new userSessionModel();
        var sql = sqlStatement.selectWhere(userSessionReq.tblName, userSessionReq.tblCol.session_id);
        var sessionIdHeader = request.header('Session_id');
        var sessionId = sessionIdHeader;
        database.query(sql, [sessionId])
        .then(async function(result) {
            
            if(result === undefined || result.length === 0){
                var redirect =[{'redirectTo': '/auth/logout'}]
                responseNotification(request, response, 401, 'UNAUTHORIZED', 'No Session Found', redirect);
                logger.resolveLog('session END UNAUTHORIZED-no session found---');
                return;
            }
            if(result.length>0){
                next();
                logger.resolveLog('session END OK---------------');
            }            
        });
    }
    else{
        var redirect =[{'redirectTo': '/auth/logout'}]
        responseNotification(request, response, 401, 'UNAUTHORIZED', 'login failed', redirect);
        logger.resolveLog('session END UNAUTHORIZED-login failed---');
        return;
    }
   
}
//#endRegion