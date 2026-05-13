const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "root123",
  database: "fitness_app"
});

db.connect((err) => {

  if (err) {
    console.log("MySQL Error ❌");
    console.log(err);
  } else {
    console.log("MySQL Connected ✅");
  }

});

module.exports = db;