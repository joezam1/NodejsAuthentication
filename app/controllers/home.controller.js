const responseNotification = require('../library/response.notification.js')


var home = function(app) {

    app.get("/", function(request, response) {        
        responseNotification(request, response, 200, 'OK', "Welcome to nodejs application." );
    });

    app.get('/index', (request, response) => {
        responseNotification(request, response, 200, 'OK', "HOME INDEX: public User Content.");
    });
}

module.exports = home;