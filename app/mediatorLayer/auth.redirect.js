const responseNotification = require('../library/response.notification.js');
const jwtCommon = require('../modules/authentication/jwt/jwt.common.js');
const jwtConfig = require('../modules/authentication/jwt/jwt.config.js');
const routes = require('../modules/authorization/routes.js');
const logger = require('../modules/data.recording/logger.js');
const sessionCommon = require('../modules/authentication/session/session.common.js');


    //NOTE:
    //if page request is public. ALL IS OK
    //if page request is private. Then 
    //Verify if user is trying to get a restricted resource then 
    //if user has not authorization RESPONSE 403 FORBIDDEN
    //Verify if user does have stored a sessionId. 
    //if user is not authenticated with session then RESPONSE 401 UNAUTHORIZED
    
const authRedirection = async function(request, response, next) {

    logger.resolveLog('BEGIN------------------------------------')
    var path = request.path;
    if(routes.isRoutePublic(path)){  
        next(); 
        return;
    }
    
   
    var userRequest = jwtCommon.userIsAuthorized(request, jwtConfig.accessTokenSecret);
    if (!userRequest.isAuthorized) { 
        responseNotificationDecorator(request ,response ,userRequest.responseCode ,userRequest.statusDescription ,userRequest.message)
        return;
    }


    var sessionInfo = await sessionCommon.sessionIsValid(request);
    if(sessionInfo.isValid){
        next();
    }else{ //notify
        responseNotificationDecorator(request, response, 401, 'UNAUTHORIZED', sessionInfo.message)
        logger.resolveLog('session END UNAUTHORIZED-login failed---');
    }
}

module.exports = authRedirection;

//#region private methods
function responseNotificationDecorator(request ,response ,responseCode , statusDescription ,message){
    var redirect =[{'redirectTo': '/auth/logout'}]
    responseNotification(request ,response ,responseCode ,statusDescription ,message ,redirect);
    
}
//#endRegion