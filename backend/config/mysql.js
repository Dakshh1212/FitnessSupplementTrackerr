require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env")
});

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || "fitness_app"
});

db.connect((err) => {
  if (err) {
    console.log("MySQL Error ❌");
    console.log(err.message);
  } else {
    console.log("MySQL Connected ✅");
  }
});

module.exports = db;