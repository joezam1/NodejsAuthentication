const validation = require('../library/input.common.js');


const user = function(objModel) {
    var userInfo = {
        tblName: "users",
        tblCol: {
            id: 'id',
            username: 'username',
            email: 'email',
            password: 'password',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        },
        props: {
            id: validation.isValid(objModel) ? (validation.isValid(objModel.id) ? objModel.id : 0) : 0,
            username: validation.isValid(objModel) ? (validation.isValid(objModel.username) ? objModel.username : '') : '',
            email: validation.isValid(objModel) ? (validation.isValid(objModel.email) ? objModel.email : '') : '',
            password: validation.isValid(objModel) ? (validation.isValid(objModel.password) ? objModel.password : '') : '',
            createdAt: validation.isValid(objModel) ? (validation.isValid(objModel.dateCreated) ? objModel.dateCreated : null) : null,
            updatedAt: validation.isValid(objModel) ? (validation.isValid(objModel.dateUpdated) ? objModel.dateUpdated : null) : null,
        }
    }
    return userInfo;
}


module.exports = user;