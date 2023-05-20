var mysql      = require('mysql2');
var connection = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'admin',
  database : 'Portfolio'
});
 
module.exports = connection;