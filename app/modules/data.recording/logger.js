const sessionConfig = require('../../modules/authentication/session/session.config.js');
const Enums = require('../../library/enumerators.js');

var resolveLog = function(input){
    if(sessionConfig.NODE_ENV ===Enums.env.DEVELOPMENT){
        console.log(input);
    }
}

var service ={
    resolveLog:resolveLog
}

module.exports = service;