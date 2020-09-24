'use strict';

const sqlStatement = require('../../databases/mysql/queries/generic.js');
const database = require('../../databases/mysql/database.actions.js');
const logger = require('../../data.recording/logger.js');
const inputCommon = require('../../../library/input.common.js');
const userSessionModel = require('../../../models/user_session.model.js');

var sessionIsValid = async function(request){
    logger.resolveLog('session BEGIN-------------');
    var sessionInfo={
        isValid : false,
        message:'No Session Found'
    }
    
    if(inputCommon.isValid(request.session)){
        //we check if the sessionID is stored in the database
        var userSessionReq = new userSessionModel();
        var sql = sqlStatement.selectWhere(userSessionReq.tblName, userSessionReq.tblCol.session_id);
        var sessionIdHeader = request.header('Session_id');
        await database.query(sql, [sessionIdHeader])
        .then(function(result) {
            if(inputCommon.isValid(result) && result.length>0){
                logger.resolveLog('session END OK---------------');
                sessionInfo.isValid = true;
                sessionInfo.message ='ok';
            }
        });
        return sessionInfo;
    }
    else{
        logger.resolveLog('session END UNAUTHORIZED-login failed---');
        sessionInfo.isValid = false;
        sessionInfo.message ='request session failed';
        return sessionInfo;
    }
}
const services = {
    sessionIsValid:sessionIsValid,
}
module.exports = services;