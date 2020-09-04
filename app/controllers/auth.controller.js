'use strict'

const login = require('./auth.controller.methods/login.js');
const register = require('./auth.controller.methods/register.js');
const logout = require('./auth.controller.methods/logout.js');
const createNewToken = require('./auth.controller.methods/token.create.js');

var authentication = async function(app) {
    login(app);
    register(app);
    logout(app);
    createNewToken(app);

}

module.exports = authentication;