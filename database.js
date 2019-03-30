var mongoose = require('mongoose');

var server = process.env.DB_SERVER;
var database = process.env.DB_NAME;
var user = process.env.DB_USER;
var password = process.env.DB_PASSWORD;

class Database {
    constructor() {
        this._connect();
    }

    _connect() {
        mongoose.connect(`mongodb://${user}:${password}@${server}/${database}`, { useNewUrlParser: true })
        .then(() => {
            console.log('Database connection successful');
        })
        .catch(err => {
            console.error('Database connection error');
        });
    }
}

module.exports = new Database();
