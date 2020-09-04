const validation = require('../library/input.common.js');


const role = function(objModel) {
    var roleInfo = {
        tblName: "roles",
        tblCol: {
            id: 'id',
            name: 'name',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        },
        props: {
            id: validation.isValid(objModel) ? (validation.isValid(objModel.id) ? objModel.id : 0) : 0,
            name: validation.isValid(objModel) ? (validation.isValid(objModel.name) ? objModel.name : '') : '',
            createdAt: validation.isValid(objModel) ? (validation.isValid(objModel.dateCreated) ? objModel.dateCreated : null) : null,
            updatedAt: validation.isValid(objModel) ? (validation.isValid(objModel.dateUpdated) ? objModel.dateUpdated : null) : null,
        }
    }

    return roleInfo;
}

module.exports = role;