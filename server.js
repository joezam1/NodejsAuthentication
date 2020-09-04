const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require("path");
const cookieParser = require('cookie-parser')
const Logger = require('./app/modules/data.recording/logger.js');

const privateKeyPath = path.resolve(__dirname,'./app/modules/opensslcert/localhome.key');
const certificatePath = path.resolve(__dirname,'./app/modules/opensslcert/localhome.crt');

const privateKey  = fs.readFileSync(privateKeyPath, 'utf8');
const certificate = fs.readFileSync(certificatePath, 'utf8');
const credentials = {key: privateKey, cert: certificate};

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const serverConfig = require('./app/config/server.config.js')
const userController = require('./app/controllers/user.controller.js');
const authController = require('./app/controllers/auth.controller.js');
const booksController = require('./app/controllers/books.controller.js');
const homeController = require('./app/controllers/home.controller.js');
const userSession = require('./app/modules/authentication/session/user.session.js');
const authRedirection = require('./app/mediatorLayer/auth.redirect.js');



//Only one instance of express must be created
const app = express();

//Use cors for cross site requests
app.use(cors(serverConfig.corsOptions));

app.use(cookieParser());
//Parse requests of content-type application/json
app.use(bodyParser.json());
//Parse requests of content-type application/x-www-form-url-encoded
app.use(bodyParser.urlencoded({ extended: true }));
//Define sessions
userSession(app);
// Make the requests to go to a middleware before reaching endpoints
app.use(authRedirection);

userController(app);
authController(app);
booksController(app);
homeController(app);

//Set port, listen for requests
const httpPort = serverConfig.HTTP_PORT;
const httpsPort = serverConfig.HTTPS_PORT;
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(httpPort, function() {
    Logger.resolveLog(`HTTP Server is running on port ${httpPort}.`);
});
httpsServer.listen(httpsPort , function() {
    Logger.resolveLog(`HTTPS Server is running on port ${httpsPort}.`);
});