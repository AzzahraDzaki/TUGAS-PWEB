const fs = require('fs');
const express = require('express')
const mysql = require('mysql2')
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require("path");
const moment = require('moment');
const multer = require('multer');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express()
const port = 3000

// middleware untuk parsing request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.set('views', path.join(__dirname, '/views'));

app.use('/css', express.static(path.resolve(__dirname, "public/css")));
app.use('/img', express.static(path.resolve(__dirname, "public/img")));

// template engine
app.set('view engine', 'ejs')

// layout ejs
app.use(expressLayouts);

// mengatur folder views
app.set('views', './views');

const saltRounds = 10;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'db_karin'
});

db.connect((err)=>{
  if(err) throw err
 console.log('Database konek!')
//  const sql = "SELECT * FROM users";
//     db.query(sql,(err,result)=>{
//       console.log(result)
//     })
 })



// GET
//register Page
app.get('/register', function (req, res) {
  res.render('register',{
    title:'register',
    layout:'layouts/auth-layout'
  });
})

//register Page
app.get('/login', function (req, res) {
  res.render('login',{
    title:'login',
    layout:'layouts/auth-layout'
  });
})

function requireAuth(req, res, next) {
  
  const token = req.cookies.token;

  if (!token) {
    res.redirect('/login');
    return;
  }
  

  jwt.verify(token, 'secret_key', function(err, decoded) {
    if (err) {
      res.redirect('/login');
      return;
    }

    req.user_id = decoded.user_id;
    next();
  });
}


//index Page
app.get('/', function (req, res) {
  res.render('index',{
    title:'Index',
    layout:'layouts/main-layout'
  });
})

//account Page
app.get('/account', requireAuth, function (req, res) {
  let user_id = req.user_id;
    const selectSql = `SELECT * FROM users WHERE user_id = ${user_id}`;
    db.query(selectSql, (err,result)=>{
      if (err) throw err;
      // Periksa apakah user sudah login dan aktif
      if (result[0].active === 0) {
        res.render('account',{
          user: result[0],
          title:'account',
          layout:'layouts/main-layout',
        });
      } else {
        // Jika user tidak aktif, arahkan kembali ke halaman login
        res.redirect('/login');
      }
    });
})

//recent Page
app.get('/recent', function (req, res) {
  res.render('recent',{
    title:'Recent',
    layout:'layouts/main-layout'
  });
})

//settings Page
app.get('/settings', function (req, res) {
  res.render('settings',{
    title:'settings',
    layout:'layouts/main-layout'
  });
})

//make form Page
app.get('/make-form', function (req, res) {
  res.render('make-form',{
    title:'make form',
    layout:'layouts/main-layout'
  });
})

//POST
app.post('/login', function (req, res) {
  const { usernameOrEmail, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ? OR email = ?';
  db.query(sql, [usernameOrEmail, usernameOrEmail], function(err, result) {
    if (err) throw err;

    if (result.length === 0) {
      res.status(401).send('Username or password is incorrect!');
      return;
    }

    const user = result[0];

    // compare password
    bcrypt.compare(password, user.password, function(err, isValid) {
      if (err) throw err;

      if (!isValid) {
        res.status(401).send('Username or password is incorrect!');
        return;
      }

      // generate token
      const token = jwt.sign({ user_id: user.user_id }, 'secret_key');
      res.cookie('token', token, { httpOnly: true });

      res.redirect('/');
    });
  });
});


//register
app.post('/register', function (req, res) {
  const { email, username, password, confirm_password } = req.body;
  
  if (password !== confirm_password) {
    // Passwords do not match, send error response
    return res.status(400).send('Konfirmasi password tidak cocok!');
  }
  
  // check if username or email already exists
  const sqlCheck = 'SELECT * FROM users WHERE username = ? OR email = ?';
  db.query(sqlCheck, [username, email], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      // username or email already exists, send error response
      return res.status(400).send('Username atau email sudah terdaftar');
    }

    // hash password
    bcrypt.hash(password, saltRounds, function(err, hash) {
      if (err) throw err;

      // insert user to database
      const sqlInsert = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';
      const values = [email, username, hash];
      db.query(sqlInsert, values, (err, result) => {
        if (err) throw err;
        console.log('user terdaftar');
        res.redirect('/login');
      });
    });
  });
});



app.listen(port,()=>{
  console.log(`listening on port ${port}`)
})

