'use strict';

const jwt = require('jsonwebtoken');
const jwtConfig = require('./jwt.config.js');
const responseNotification = require('../../../library/response.notification.js');
const input = require('../../../library/input.common.js');
const routes = require('../../authorization/routes.js');
const logger = require('../../data.recording/logger.js')


var createAccessToken = function(userDb, userRoles) {
    var userInfo = { id: userDb.id, username: userDb.username, email: userDb.email, roles: userRoles }
    var accessToken = jwt.sign(userInfo, jwtConfig.accessTokenSecret, { expiresIn: jwtConfig.accessTokenTimeout });
    return accessToken;
}

var createRefreshToken = function(userDb, userRoles) {
    var userInfoRefreshToken = { id: userDb.id, username: userDb.username, email: userDb.email, roles: userRoles };
    const refreshToken = jwt.sign(userInfoRefreshToken, jwtConfig.refreshTokenSecret, { expiresIn: jwtConfig.refreshTokenTimeout });
    jwtConfig.allRefreshTokens.push(refreshToken);
    return refreshToken;
}

var userIsAuthorized_notification = function(request, response, tokenSecret) {
    var selectedRouteAuthLevel = routes.getRouteAuthorizationLevel(request.path);
    var userVerifiedTokenPayload = getVerifiedAccessTokenPayload_notification(request, response, tokenSecret);
    if (input.isValid(userVerifiedTokenPayload)) {
        var selectedUserIsAuthorized = validateUserAuthorization_notification(userVerifiedTokenPayload, selectedRouteAuthLevel, request, response);
        return selectedUserIsAuthorized;
    }
    return false;
}

var getAccessToken = function(request) {
    const authHeader = request.headers.authorization;
    if (input.isValid(authHeader)) {
        const tokenInfo = authHeader.split(' ');
        var token = null;
        if (tokenInfo.length > 1) {
            token = tokenInfo[1];
        }
        return token;
    }
    return null;
}

var getDecodedJwtTokenPayload = function(selectedToken, tokenSecret) {
    var tokenInfo = {
        status: 'ok',
        message: 'success',
        payload: null,
    }
    var decodedToken = jwt.verify(selectedToken, tokenSecret, function(error, jwtDecoded) {
        if (error) {
            if(tokenSecret === jwtConfig.accessTokenSecret){
                logger.resolveLog('ERROR: access-token')
            }
            if(tokenSecret === jwtConfig.refreshtokenSecret){
                logger.resolveLog('ERROR: refresh-token');
            }
            console.log('jwt-verify-error:', error);
            tokenInfo.status = 'error';
            if (error.name === 'TokenExpiredError') {
                tokenInfo.message = 'expired';
            } else {
                tokenInfo.message = 'error';
            }
            return error;
        }
        return jwtDecoded;
    })
    logger.resolveLog(decodedToken);
    tokenInfo.payload = decodedToken;
    return tokenInfo;
}

var isDecodedTokenValid = function(decodedTokenObj) {
    if (decodedTokenObj.status === 'ok') {
        return true;
    }
    if (decodedTokenObj.status === 'error') {
        return false;
    }
}

var errorTokenNotValidNotification = function (request, response, errorObj) {
    var redirectAction = [{ 'redirectTo': '/auth/logout' }, errorObj];  
    responseNotification(request, response, 500, 'ERROR', 'Token is not valid. There is an error', redirectAction);
}

var forbiddenTokenNotFoundNotification = function(request, response) {
    var redirectAction = [{ 'redirectTo': '/auth/logout' }];
    responseNotification(request, response, 403, 'FORBIDDEN', 'Token not found - force redirect', redirectAction);
}


var jwtCommon = {
    createAccessToken: createAccessToken,
    createRefreshToken: createRefreshToken,
    userIsAuthorized_notification: userIsAuthorized_notification,
    getAccessToken: getAccessToken,
    getDecodedJwtTokenPayload: getDecodedJwtTokenPayload,
    isDecodedTokenValid: isDecodedTokenValid,
    errorTokenNotValidNotification:errorTokenNotValidNotification,
    forbiddenTokenNotFoundNotification:forbiddenTokenNotFoundNotification,
}

module.exports = jwtCommon


// #region Private Methods
function validateUserAuthorization_notification(user, selectedRouteAuthLevel,request, response) {
    var authorized = false;
    if (input.isValid(selectedRouteAuthLevel)) {
        if (user !== undefined) {
            for (var a = 0; a < user.roles.length; a++) {
                for (var b = 0; b < selectedRouteAuthLevel.length; b++) {
                    if (selectedRouteAuthLevel[b] === user.roles[a]) {
                        authorized = true;
                        break;
                    }
                }
            }
        }
    }
    if (!authorized) {       
        responseNotification(request,response, 403, 'FORBIDDEN', 'Not allowed to access the resource');
    }
    return authorized;
}

function getVerifiedAccessTokenPayload_notification(request, response, tokenSecret) {
    var selectedToken = getAccessToken(request);
    if (input.isValid(selectedToken)) {
        var verifiedToken = getOperationalAccessToken_notification(selectedToken, tokenSecret, request, response)
        return verifiedToken;
    }
    forbiddenTokenNotFoundNotification(request, response);
    return null;
}

function getOperationalAccessToken_notification(accessToken, tokenSecret, request, response) {
    var accessTokenObj = getDecodedJwtTokenPayload(accessToken, tokenSecret);
    var accessTokenIsFunctional = isDecodedTokenFunctional_notification(accessTokenObj, jwtConfig.accessTokenSecret,request, response);

    if (accessTokenIsFunctional) {
        if (isDecodedTokenExpired(accessTokenObj)) {
            //replace access-token
            logger.resolveLog('AccessToken Expired BEGIN Replacement---------');
            var refreshTokenRequest = getSelectedHeaderRequest(request, 'Refresh_token');
            var refreshToken = input.getElementFromArray(jwtConfig.allRefreshTokens, refreshTokenRequest);
            if (input.isValid(refreshToken)) {
                var refreshTokenObj = getDecodedJwtTokenPayload(refreshToken, jwtConfig.refreshTokenSecret);
                var refreshTokenIsFunctional = isDecodedTokenFunctional_notification(refreshTokenObj, jwtConfig.refreshTokenSecret,request, response);

                if (refreshTokenIsFunctional) {
                    if (isDecodedTokenExpired(refreshTokenObj)) {
                        forbiddenTokenExpiredNotification(request, response);
                        logger.resolveLog('AccessToken Expired END Replacement NULL------------');
                        return null;
                    }
                    var newTokenObj = processAccessTokenRecreationFromTokenObj_notification(refreshTokenRequest, request, response);
                    if(input.isValid(newTokenObj)){
                        logger.resolveLog('AccessToken Expired END Replacement OK------------');
                        return newTokenObj.payload;
                    }
                }
                return null;
            }
            forbiddenTokenNotFoundNotification(request, response);
            logger.resolveLog('AccessToken Expired END Replacement NULL------------');
            return null;
        }
        //provide access-token payload
        return accessTokenObj.payload;
    }
    return null;
}

function isDecodedTokenFunctional_notification(selectedTokenObj, selectedTokenSecret,request, response) {
    var isValidToken = isDecodedTokenValid(selectedTokenObj);
    if (!isValidToken) {
        if (selectedTokenSecret === jwtConfig.accessTokenSecret) {
            if (isDecodedTokenExpired(selectedTokenObj)) {
                return true;
            }
        }
        var errorObj = { 'tokenObjError': selectedTokenObj.payload };
        errorTokenNotValidNotification(request, response, errorObj);
    }
    return isValidToken;
}

function isDecodedTokenExpired(decodedTokenObj) {
    if (decodedTokenObj.status === 'error' && decodedTokenObj.message == 'expired') {
        return true;
    }
    return false;
}

function getSelectedHeaderRequest(request, headerName) {
    var selectedHeader = request.header(headerName);
    return selectedHeader;
}

function processAccessTokenRecreationFromTokenObj_notification(refreshTokenRequest, request, response) {
    var newAccessToken = reCreateAccessToken(refreshTokenRequest);
    if (input.isValid(newAccessToken)) {
        var newAccessTokenObj = getDecodedJwtTokenPayload(newAccessToken, jwtConfig.accessTokenSecret);
        var newAccessTokenIsValid = isDecodedTokenValid(newAccessTokenObj)
        if (newAccessTokenIsValid) {
            setReplacementTokenRequestHeader(request, newAccessToken);
            setReplacementTokenStorage(request, newAccessToken);

            return newAccessTokenObj;
        }
    }
    errorTokenNotValidNotification(request,response);
    return null;
}

function setReplacementTokenRequestHeader(request, newAccessToken) {
    var bearer = 'Bearer ' + newAccessToken;
    request.headers.authorization = bearer;
}

function setReplacementTokenStorage( request, newAccessToken) {   
    const sessionId = request.headers.session_id;
    const accessTokenInfo = {
        sessionId : sessionId,
        accessTokenReplacement : newAccessToken
    }
    jwtConfig.accessTokenStorage.push(accessTokenInfo);
    logger.resolveLog('setReplacementTokenStorage-length:',jwtConfig.accessTokenStorage.length);
}

function reCreateAccessToken(refreshToken) {
    var decodedRefreshTokenObj = getDecodedJwtTokenPayload(refreshToken, jwtConfig.refreshTokenSecret);
    if (decodedRefreshTokenObj.status === 'ok') {
        var userDb = {
            id: decodedRefreshTokenObj.payload.id,
            username: decodedRefreshTokenObj.payload.username,
            email: decodedRefreshTokenObj.payload.email,
        }
        var roles = decodedRefreshTokenObj.payload.roles;
        var newAccessToken = createAccessToken(userDb, roles);
        return newAccessToken;
    }
    return null;
}

function forbiddenTokenExpiredNotification(request, response) {
    var redirectAction = [{ 'redirectTo': '/auth/logout'}]
    responseNotification(request, response, 403, 'FORBIDDEN', 'Token Expired - force redirect', redirectAction);
}
// #end-region Private Methods