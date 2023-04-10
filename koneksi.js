var mysql = require('mysql');

//buat koneksi database
const connect = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'db_pweb1'
});

connect.connect((err)=>{
    if(err) throw err;
    console.log('Mysql terkoneksi');
});

module.exports = connect;
