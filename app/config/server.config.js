const logger = require('../modules/data.recording/logger.js');


var whitelist = ['http://localhost:3080','https://localhost:3080', 'http://localhost:3000','https://localhost:3443']

const serverConfig = {
  HTTP_PORT: 5000,
  HTTPS_PORT:5443,
  corsOptions: {
    origin: function (origin, callback) {
      logger.resolveLog('origin:',origin);
      if(origin !== undefined) {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }

      }else{
        //NOTE: usage for development with POSTMAN 
        // comment out when deploying to production
        callback(null, true)
      }          
    }
  }
}


  

module.exports = serverConfig;