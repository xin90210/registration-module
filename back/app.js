const mysql = require('mysql');

// Config

const conn = mysql.createConnection({
    host: "db4free.net", 
    user: "test_db_admin",
    database: "test_db_06_10_20",
    password: "testdbpass"
});

conn.connect(function (err) {
    if (err) {
        return console.error("Ошибка: " + err.message);
    }
    else {
        console.log("Подключение к серверу MySQL успешно установлено");
    }
});

let query="SELECT `name`, `login` FROM users";

conn.query(query, (err, result, field) =>{
    console.log(err);
    console.log(result);
});
