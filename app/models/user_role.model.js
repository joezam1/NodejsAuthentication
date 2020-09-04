const validation = require('../library/input.common.js');


const userRole = function(objModel) {
    var userRoleInfo = {
        tblName: "user_roles",
        tblCol: {
            userId: 'userId',
            roleId: 'roleId',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        },
        props: {
            userId: validation.isValid(objModel) ? (validation.isValid(objModel.userId) ? objModel.userId : 0) : 0,
            roleId: validation.isValid(objModel) ? (validation.isValid(objModel.roleId) ? objModel.roleId : 0) : 0,
            createdAt: validation.isValid(objModel) ? (validation.isValid(objModel.password) ? objModel.dateCreated : null) : null,
            updatedAt: validation.isValid(objModel) ? (validation.isValid(objModel.password) ? objModel.dateUpdated : null) : null,
        }
    }
    return userRoleInfo;
}


module.exports = userRole;