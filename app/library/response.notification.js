const validation = require('./input.common.js');
const jwtConfig = require('../modules/authentication/jwt/jwt.config.js');
const input = require('../library/input.common.js');
const logger = require('../modules/data.recording/logger.js');


var responseNotification = function(request, response, code, statusDescription, message, arrayOfObj = null) {

    logger.resolveLog('responseNotification-BEGIN');
    var sessionIdRequest = request.headers.session_id;
    var selectedTokenInfo = getAccessTokenInfoFromStorage(sessionIdRequest);
    var tokenIsReplaced = false;
    var tokenReplacement = null;
    if(input.isValid(selectedTokenInfo)){
        tokenIsReplaced = true;
        tokenReplacement = selectedTokenInfo.tokenObj.accessTokenReplacement;
        jwtConfig.accessTokenStorage.splice(selectedTokenInfo.tokenObj.index, 1);
    }
    logger.resolveLog('responseNotifiation-tokenStorage-length',jwtConfig.accessTokenStorage.length);
    validateInputs(code, statusDescription, message);
    try {
        var responseObj = {
            status: statusDescription,
            message: message,
            accessTokenReplaced: tokenIsReplaced,
            replacementToken:tokenReplacement
        }
        if (arrayOfObj !== null) {
            for (var i = 0; i < arrayOfObj.length; i++) {
                for (var key in arrayOfObj[i]) {
                    responseObj[key] = arrayOfObj[i][key];
                }
            }
        }

        var responseObjStringifyJson = JSON.stringify( responseObj)
        response.status(code).send(responseObjStringifyJson);    
    } catch (error) {
        throw new Error('Error: ' + error);
    }
    logger.resolveLog('responseNotification-END');
}


module.exports = responseNotification;


// #region private methods 
function getAccessTokenInfoFromStorage(sessionIdReq){
    var tokenReplacementObj = null;
    var index = 0;
    for(var a = 0; a<jwtConfig.accessTokenStorage.length; a++){
        if(jwtConfig.accessTokenStorage[a].sessionId === sessionIdReq){
            tokenReplacementObj = jwtConfig.accessTokenStorage[a];
            index = a;
            break;
        }
    }
    var tokenInfo= (tokenReplacementObj === null)? null: { tokenObj:tokenReplacementObj, index:index }
    return tokenInfo;
}

function validateInputs(code, status, message) {
    var missingInputs = [];
    if (!validation.isValid(code)) { missingInputs.push('code'); }
    if (!validation.isValid(status)) { missingInputs.push('status'); }
    if (!validation.isValid(message)) { missingInputs.push('message'); }
    if (missingInputs.length > 0) {
        var allInputs = ''
        for (var a = 0; a < missingInputs.length; a++) {
            allInputs += missingInputs[a];
            if (a > 0) {
                allInputs += ', ' + missingInputs[a]
            }
        }

        var inputNotification = (counter === 1) ? `The input ${allInputs} is ` : `The inputs ${allInputs} are `;
        var notification = inputNotification + 'missing from the response object';
        throw new Error("Error: " + notification);
    }
}
// #end-region private methods