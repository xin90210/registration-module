const mysql = require('mysql');

const db = mysql.createConnection({
    host: "db4free.net", 
    user: process.env.MYSQL_LOGIN,
    database: "test_db_06_10_20",
    password: process.env.MYSQL_PASSWORD
});

db.connect(function (err) {
    if (err) {
        return console.error(err.message);
    }
    else {
        console.log("Connected to DB");
    }
});

module.exports = db
