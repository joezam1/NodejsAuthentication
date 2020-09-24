'use strict';

const sessionConfig = require('../../modules/authentication/session/session.config.js');
const jwtConfig = require('../../modules/authentication/jwt/jwt.config.js');
const input = require('../../library/input.common.js');
const responseNotification = require('../../library/response.notification.js');


var logout = function(app) {

    app.get('/api/logout', (request, response) => {
        //1-destroy refreshToken;
        //2-redirect to home page;
        try {           
            var headerRequestName = 'Refresh_token';
            var refreshTokenHeaderReq = request.header(headerRequestName);
            
            var refreshToken = input.getElementFromArray(jwtConfig.allRefreshTokens,refreshTokenHeaderReq);  
            if (input.isValid(refreshToken)) {
                var activeRefreshTokens = processRefreshTokenDeletion(refreshToken, jwtConfig.allRefreshTokens);
                jwtConfig.allRefreshTokens = activeRefreshTokens.newArray;                
            }
            destroySession(request, response, sessionConfig.SESSION_NAME);
            notifyUser(request,response);
        } catch (error) {
            var message = "Error happened in the logout process ";
            var errorTrace = new Error('error', error);
            var notification = [{'errorTrace': errorTrace},{ 'redirectTo': '/' }]
            responseNotification(request, response, 500, 'ERROR',message, notification);
        }
    })
}

module.exports = logout;

// #region Private Methods
function processRefreshTokenDeletion(token, tokens) {
    var initialCount = tokens.length;
    var cloneArray = tokens.slice(0);
    var newArray = cloneArray.filter(function(t) { t !== token });

    var endingCount = newArray.length;
    var tokensDestroyedCount = initialCount - endingCount;
    return {
        tokensDestroyedCount: tokensDestroyedCount,
        newArray: newArray
    };
}

function destroySession(request, response, sessionName) {
    request.session.destroy(function(err){
        if (err) {
            var message = 'session could not be destroyed';
            var errorTrace = new Error('error', error);
            var redirectAction = [{'errorTrace': errorTrace},{ 'redirectTo': '/' }]
            responseNotification(request, response, 500, 'ERROR', message, redirectAction);
            return;
        }
    });
    response.clearCookie(sessionName);
}

function notifyUser(request, response) {
    var message = 'refreshToken and session destroyed - logout success';
    responseNotification(request, response, 200, 'OK', message);
}

// #end-region Private Methods