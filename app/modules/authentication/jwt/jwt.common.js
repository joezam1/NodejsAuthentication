'use strict';

const jwt = require('jsonwebtoken');
const jwtConfig = require('./jwt.config.js');
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

var userIsAuthorized = function(request, tokenSecret) {
    
    var selectedRouteAuthLevel = routes.getRouteAuthorizationLevel(request.path);
    var userVerifiedTokenObj = getVerifiedAccessTokenObj(request, tokenSecret);
    if (input.isValid(userVerifiedTokenObj.payload)) {
        var selectedUserIsAuthorized = validateUserAuthorization(userVerifiedTokenObj.payload, selectedRouteAuthLevel);
        if(!selectedUserIsAuthorized){
            return getAuthorizationInfoObj(false,403,'FORBIDDEN','Not allowed to access the resource');
        }
        return getAuthorizationInfoObj(true,200,'OK','User allowed to access the resource');
    }
    return getAuthorizationInfoObj(false,userVerifiedTokenObj.responseCode,userVerifiedTokenObj.statusDescription,userVerifiedTokenObj.message);
}

function getAuthorizationInfoObj(authorization,code,description,message){
    var authorizationInfoObj ={isAuthorized: authorization, responseCode:code,statusDescription:description, message:message}
    return authorizationInfoObj;
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
        error:null
    }
    var decodedToken = jwt.verify(selectedToken, tokenSecret, function(error, jwtDecoded) {
        if (error) {
            if(tokenSecret === jwtConfig.accessTokenSecret){ logger.resolveLog('ERROR: access-token')}
            if(tokenSecret === jwtConfig.refreshtokenSecret){ logger.resolveLog('ERROR: refresh-token');}
            console.log('jwt-verify-error:', error);
            tokenInfo.status = 'error';
            if (error.name === 'TokenExpiredError') {
                tokenInfo.message = 'expired';
            } else {
                tokenInfo.message = 'error';
            }
            tokenInfo.error =JSON.stringify(error);
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


var jwtCommon = {
    createAccessToken: createAccessToken,
    createRefreshToken: createRefreshToken,
    userIsAuthorized: userIsAuthorized,
    getAccessToken: getAccessToken,
    getDecodedJwtTokenPayload: getDecodedJwtTokenPayload,
    isDecodedTokenValid: isDecodedTokenValid
}

module.exports = jwtCommon


// #region Private Methods

function validateUserAuthorization(user, selectedRouteAuthLevel) {
    if (input.isValid(selectedRouteAuthLevel)) {
        if (user !== undefined) {
            for (var a = 0; a < user.roles.length; a++) {
                for (var b = 0; b < selectedRouteAuthLevel.length; b++) {
                    if (selectedRouteAuthLevel[b] === user.roles[a]) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function getVerifiedAccessTokenObj(request, tokenSecret) {
    var selectedToken = getAccessToken(request);
    if (input.isValid(selectedToken)) {
        //is returned and objectInfo 
        var verifiedTokenObj = getOperationalAccessTokenInfo(selectedToken, tokenSecret, request)
        return verifiedTokenObj;
    }
    return null;
}

function getOperationalAccessTokenInfo(accessToken, tokenSecret, request) {

    var accessTokenObj = getDecodedJwtTokenPayload(accessToken, tokenSecret);
    if(isDecodedTokenValid(accessTokenObj)){
         //provide access-token payload
        return getObjInfo(accessTokenObj.payload,200,'OK','access-token');
    }

    if (isDecodedTokenExpired(accessTokenObj)) {
        //replace access-token
        logger.resolveLog('AccessToken Expired BEGIN Replacement---------');
        var refreshTokenRequest = getSelectedHeaderRequest(request, 'Refresh_token');
        var refreshToken = input.getElementFromArray(jwtConfig.allRefreshTokens, refreshTokenRequest);
        if (input.isValid(refreshToken)) {
            var refreshTokenObj = getDecodedJwtTokenPayload(refreshToken, jwtConfig.refreshTokenSecret);
            if (isDecodedTokenExpired(refreshTokenObj)) {
                logger.resolveLog('AccessToken Expired END Replacement NULL------------');
                return getObjInfo(null,403,'FORBIDDEN','Refresh Token Expired - force redirect');
            }

            var newTokenObj = processAccessTokenRecreationFromTokenObj(refreshTokenRequest, request);
            if(input.isValid(newTokenObj)){
                logger.resolveLog('AccessToken Expired END Replacement OK------------');
                return getObjInfo(newTokenObj.payload,200,'OK','access-token');     
            } //notify
            return getObjInfo(null,500,'ERROR','Token is not valid. There is an error')
        }
        logger.resolveLog('AccessToken Expired END Replacement NULL------------');
        return getObjInfo(null,403,'FORBIDDEN','Refresh Token not found - force redirect');
    }
    return getObjInfo(null,500,'ERROR','Token is not valid. Error: '+accessTokenObj.error)
}

function getObjInfo(payload,code,status,message){
    var accessTokenInfo ={payload:payload,responseCode:code,statusDescription:status, message:message}
    return accessTokenInfo
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

function processAccessTokenRecreationFromTokenObj(refreshTokenRequest, request) {
    var newAccessToken = reCreateAccessToken(refreshTokenRequest);
    if (input.isValid(newAccessToken)) {
        var newAccessTokenObj = getDecodedJwtTokenPayload(newAccessToken, jwtConfig.accessTokenSecret);
            setReplacementTokenRequestHeader(request, newAccessToken);
            setReplacementTokenStorage(request, newAccessToken);

            return newAccessTokenObj;
    }
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

// #end-region Private Methods