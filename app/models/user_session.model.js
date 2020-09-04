const validation = require('../library/input.common.js');


const userSession = function(objModel) {
    var userSessionInfo = {
        tblName: "users_sessions",
        tblCol: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        },
        props: {
            session_id: validation.isValid(objModel) ? (validation.isValid(objModel.session_id) ? objModel.session_id : 0) : 0,
            expires: validation.isValid(objModel) ? (validation.isValid(objModel.expires) ? objModel.expires : '') : '',
            data: validation.isValid(objModel) ? (validation.isValid(objModel.data) ? objModel.data : null) : null,
        }
    }

    return userSessionInfo;
}

module.exports = userSession;