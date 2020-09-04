const jwt = require('jsonwebtoken');
const responseNotification = require('../library/response.notification.js');


//Mock Database Response BEGIN===================
const allBooksCollection = [{
            "id":1,
            "author": "Chinua Achebe",
            "country": "Nigeria",
            "language": "English",
            "pages": 209,
            "title": "Things Fall Apart",
            "year": 1958
        },
        {
            "id":2,
            "author": "Hans Christian Andersen",
            "country": "Denmark",
            "language": "Danish",
            "pages": 784,
            "title": "Fairy tales",
            "year": 1836
        },
        {
            "id":3,
            "author": "Dante Alighieri",
            "country": "Italy",
            "language": "Italian",
            "pages": 928,
            "title": "The Divine Comedy",
            "year": 1315
        },
    ]
    //Mock Database Response END==================

var books = function(app) {
    app.get('/api/books', async function(request, response) {

        var allBooksInfo = [{ 'result': allBooksCollection }];
        responseNotification(request,response, 200, 'OK', 'all Books', allBooksInfo);
        return;
    });
}


module.exports = books;