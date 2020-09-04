const jwtCommon = require('../../modules/authentication/jwt/jwt.common.js');
const jwtConfig = require('../../modules/authentication/jwt/jwt.config.js');
const responseNotification = require('../../library/response.notification.js');
const input = require('../../library/input.common.js');

//Re-create Process
// 1-Get refreshToken from the request
// 2-Check that is in the list of refresh tokens
// 3-If true, create new accessToken
// 4-If false, notify logout
//NOTE: As an alternative in the middleware it can be setup a process 
//to refresh any token that is invalid due to expiry
//to avoid too many requests going back and forth.
var createNewToken = function(app) {
    app.post('/api/token', async function(request, response) {

        var headerRequestName = 'Refresh_token';
        var refreshTokenHeaderReq = request.header(headerRequestName);

        var refreshToken = input.getElementFromArray(jwtCommon.allRefreshTokens, refreshTokenHeaderReq)
        if (input.isValid(refreshToken)) {
            var tokenInfoObject = jwtCommon.getDecodedJwtTokenPayload(refreshToken, jwtConfig.refreshTokenSecret);
            var verifiedToken = jwtCommon.isDecodedTokenValid(tokenInfoObject);
            if (verifiedToken) {
                var userInfo = tokenInfoObject.payload;
                var userDb = { id: userInfo.id, username: userInfo.username, email: userInfo.email }
                var roles = userInfo.roles;

                const accessToken = jwtCommon.createAccessToken(userDb, roles);
                var tokenInfo = [{ "accessToken": accessToken }];
                responseNotification(request, response, 200, "OK", "success. new access-token created", tokenInfo);
            }
        }
        jwtCommon.forbiddenTokenNotFoundNotification(request, response);
        return null;
    });
}


module.exports = createNewToken;