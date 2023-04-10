var connection = require('../koneksi');
var mysql = require('mysql');
var md5 = require('md5');       //password
var response = require('../res');
var jwt = require('jsonwebtoken');
var config = require('../config/secret');
var ip = require('ip');

//controller untuk register
exports.registrasi = function(req, res) {       // untuk mengekspor fungsi registrasi (registrasi user)
    var post = {
        username: req.body.username,
        email: req.body.email,
        password: md5(req.body.password),
        created_at: new Date(),
        updated_at: new Date()
    }

    var query = "SELECT email FROM ?? WHERE ??=?";
    var table = ["users", "email", post.email];
    
    query = mysql.format(query, table);

    connection.query(query,function(error, rows){ 
        if(error){
            console.log(error);
        }else{
            if(rows.length == 0){
                var query = "INSERT INTO ?? SET ?";
                var table = ["users"];
                query = mysql.format(query,table);
                connection.query(query, post, function(error, rows){
                    if(error){
                        console.log(error);
                    }else{
                        response.ok("Berhasil menambahkan data user baru", res);
                    }
                });
            }else{
                response.ok("Email sudah terdaftar!", res);
            }
        }
    })
}

//controller Login
exports.login = function(req, res) { 
    var post = {
        password: req.body.password,
        email: req.body.email
    }
    var query = "SELECT * FROM ?? WHERE ??=? AND??=?";
    var table = ["users","password", md5(post.password), "email", post.email]; 

    query = mysql.format(query,table);

    connection.query(query, function(error, rows){
        if (error){
            console.log(error);
        }else {
            if(rows.length == 1){
                var token = jwt.sign({rows}, config.secret, {
                    expiresIn: 1440
                });

                user_id= rows[0].id;

                var data = {
                    user_id: user_id,
                    access_token: token,
                    ip_address: ip.address()
                }
                var query = "INSERT INTO ?? SET ?";
                var table = ["akses_token"];

                query = mysql.format(query, table);
                connection.query( query, data, function(error, rows){
                    if(error){
                        console.log(error);
                    }else{
                        res.json({
                            success: true,
                            message: 'Token JWT tergenerate!',
                            token:token,
                            currUser: data.user_id                      
                        }); 
                    }
                });
    
            }else{
                res.json({"Error": true, "Message": "Email atau password salah"});
            }
        }
    });
}