var mysql      = require('mysql2');
require('dotenv').config();

console.log(process.env.DB_HOST + ' 1')

var connection = mysql.createPool({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : 'Portfolio'
});
 
module.exports = connection;