'use strict'
const bcrypt = require('bcryptjs');
const userModel = require('../../models/user.model.js');
const roleModel = require('../../models/role.model.js');
const userRoleModel = require('../../models/user_role.model.js');
const sqlStatement = require('../../modules/databases/mysql/queries/generic.js');
const database = require('../../modules/databases/mysql/database.actions.js');
const responseNotification = require('../../library/response.notification.js');
const jwtCommon = require('../../modules/authentication/jwt/jwt.common.js');
const logger = require('../../modules/data.recording/logger.js');


var login = function(app) {

    app.post('/api/login', async function(request, response) {
        logger.resolveLog('login-request',request);
        var userReq = new userModel(request.body);
        var sql = sqlStatement.selectWhere(userReq.tblName, userReq.tblCol.email);
        var userDb = null;

        database.query(sql, [userReq.props.email])

        .then(async function(result) {
            if (result === undefined) return;
            //==========================
            //Mysql does not need a permanent open and closing of its connection 
            //database.close();
            //==========================
            var userExist = validateLoginUser(result, userReq, response);
            if(!userExist) return;
            userDb = result[0];
            var passwordIsValid = await validateLoginPassword(userDb, userReq, response);
            if(!passwordIsValid) return;
            var userRole = new userRoleModel();
            var role = new roleModel();

            var sqlInnerJoin = sqlStatement.selectInnerJoinWhereTblOne(userRole.tblName, role.tblName, userRole.tblCol.roleId, role.tblCol.id, userRole.tblCol.userId);
            return await database.query(sqlInnerJoin, userDb.id);
            
        })
        .then(function(result) {

                if (result === undefined) { return; };
                
                request.session.userId = userDb.id;
                //Save the session to the database
                request.session.save;
                var allRoles = getAllRolesFromDb(result);
                var jwtTokens = createUserJwtTokens(userDb, allRoles);
                var authenticationInfo = [{ "accessToken": jwtTokens.accessToken }, 
                                          { "refreshToken": jwtTokens.refreshToken },
                                          {"sessionInfo":request.session},
                                          {"sessionID": request.sessionID}
                                         ]
                responseNotification(request, response, 200, 'OK', 'login Successful', authenticationInfo);
            }, function(error) {
                throw new Error('Error: ' + error)
            })
            .catch((err) => {
                throw new Error("Error:" + err)
            });
    });
}

module.exports = login;

//#region private methods
function validateLoginUser(result, selectedUser, response) {
    if (result.length > 0) {
        return true;
    }
    var redirect =[{'redirectTo': '/auth/logout'}]
    responseNotification(request, response, 401, 'UNAUTHORIZED',`login failed. ${selectedUser.props.email} does not exits`, redirect);
   
    return false;
}

async function validateLoginPassword(userDb, userRequest, response) {
    const comparison = await bcrypt.compare(userRequest.props.password, userDb.password);
    switch (comparison) {
        case true:
            return true;
        case false:
            responseNotification(request,response, 401, 'UNAUTHORIZED', 'Email or password do not match');
            return false;
    }
}

function getAllRolesFromDb(userRolesDb) {
    var allRoles = [];
    for (var a = 0; a < userRolesDb.length; a++) {
        allRoles.push(userRolesDb[a].name)
    }
    return allRoles;
}

function getAllRolesFromDb(userRolesDb) {
    var allRoles = [];
    for (var a = 0; a < userRolesDb.length; a++) {
        allRoles.push(userRolesDb[a].name)
    }
    return allRoles;
}

function createUserJwtTokens(userDb, userRoles) {
    const accessToken = jwtCommon.createAccessToken(userDb,userRoles);
    const refreshToken = jwtCommon.createRefreshToken(userDb, userRoles);
    return { accessToken, refreshToken };
}
//#end-region private method