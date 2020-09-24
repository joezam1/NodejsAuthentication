const pool =  {
         max: 5,
         min: 0,
         acquire: 30000,
         idle: 10000
     }

const mysqlDb = {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "abc123!@#",
    DB: "nodejsauth",
    PORT: 3306
};

module.exports = mysqlDb;