'use strict';

const userModel = require('../../models/user.model.js');
const roleModel = require('../../models/role.model.js');
const userRoleModel = require('../../models/user_role.model.js');
const responseNotification = require('../../library/response.notification.js');
const sqlStatement = require('../../modules/databases/mysql/queries/generic.js');
const database = require('../../modules/databases/mysql/database.actions.js');
const logger = require('../../modules/data.recording/logger.js');

const bcrypt = require('bcryptjs');
const saltRounds = 8;


var register = function(app) {

    app.post('/api/register', async function(request, response) {      
        var user = new userModel(request.body);
        const password = user.props.password;
        const encryptedPassword = await bcrypt.hash(password, saltRounds);
        user.props.password = encryptedPassword;
        user.props.createdAt = new Date();
        user.props.updatedAt = new Date(); 
        var selectWhere = sqlStatement.selectWhereOr(user.tblName, user.tblCol.username, user.tblCol.email);

        database.query(selectWhere, [user.props.username, user.props.email])

        .then(function(result) {
            if (result === undefined || result === null) return;
            if (result.length > 0) {
                validateUserRegistration(request, response, result, user.props.username, user.props.email);
                return;
            } else {
                var sqlInsertUser = sqlStatement.insertIntoSet(user.tblName);
                return database.query(sqlInsertUser, [user.props]);
            }
        })

        .then(function(result) {
            if (result === undefined) return;
            if (result.affectedRows === 1) {
                user.props.id = result.insertId;
            }
            var role = new roleModel();
            var sqlGetRoles = sqlStatement.selectAll(role.tblName);
            return database.query(sqlGetRoles);
        })

        .then(function(result) {
            if (result === undefined) return;
            var userRoles = request.body.roles;
            var allRoles = result;
            var userRolesArray = createTableValues(user.props.id, allRoles, userRoles);
            var userRole = new userRoleModel();
            var sqlInsertValues = sqlStatement.insertIntoValues(userRole.tblName, userRole.props);
            return database.query(sqlInsertValues, [userRolesArray]);
        })

        .then(function(result) {
                logger.resolveLog('result:',result);
                if (result === undefined) return;
                //NOTE: Sessions are not set on Registration. 
                //Sessions will be managed by login-logout data flow
               
                validateDatabaseUserRegistration(result, user, request, response);

            }, function(error) {
                throw new Error('Error: ' + error)

            })
        .catch((err) => {
            throw new Error("Error:" + err)
        });
    });
}

module.exports = register;

// #region private Methods
function validateUserRegistration(request,response, usersDb, username, email) {
    var message = '';
    for (var a = 0; a < usersDb.length; a++) {
        if (usersDb[a].username === username) {
            message = `the username ${username} is already taken.`;
            break;
        }
        if (usersDb[a].email === email) {
            message = `the email ${email} is already taken.`;
            break;
        }
    }

    if (message !== '') {
        responseNotification(request,response, 401, 'UNAUTHORIZED', message);
    }
    return;
}

function validateDatabaseUserRegistration(result, selectedUser, request,response) {
    if (result.affectedRows >= 1) {
        var redirectNotification = [{ "redirectTo": '/auth/logout' }]
        responseNotification(request,response, 200, 'OK', `The username ${selectedUser.props.username} has been registered successfully.`, redirectNotification);
    } else {
        var errorDescription = [{ "result": result }]
        responseNotification(request,response, 400, 'BAD REQUEST', 'an error occurred', errorDescription);
    }
}

function createTableValues(userId, allRoles, userRoles) {
    var userRolesArray = [];
    for (var i = 0; i < userRoles.length; i++) {
        for (var a = 0; a < allRoles.length; a++) {
            var role = roleModel(allRoles[a]);
            if (role.props.name.toLowerCase() === userRoles[i].toLowerCase()) {
                var createdAt = new Date();
                var updatedAt = new Date();
                var userRole = [userId, role.props.id, createdAt, updatedAt]
                userRolesArray.push(userRole);
                break;
            }
        }
    }
    return userRolesArray;
}

// #end-region private methods