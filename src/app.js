var express = require('express');
var hbs = require('hbs');
var bodyParser = require('body-parser');
var session = require('express-session');
var db = require('./db.js');
var fs = require('fs');
var formidable = require('formidable');
var path = require('path');
var mkdirp = require('mkdirp');
var sql = require('./sql.js');
var sanitize = require('./sanitize.js');
var md5 = require('md5');
var sess = false;
const dbInfos = db.connInfos;
const uuidv4 = require('uuid/v4');

app = express();

hbs.registerPartials(__dirname + '/../views/partials')

app.use(session({secret: 'L337 STr!nG'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'hbs');
app.set('views','/home/chmod/Desktop/node_app/views')

app.get('/', (req, res) => {
  sess = req.session;
  if (sess.logged) {
    res.render('home.hbs' , {
      logged : true
    });
  }
  else {
    res.render('home.hbs', {
      logged : false
    })
  }
});

app.get('/login', (req, res) => {
  res.render('login.hbs');
});

app.post('/login', (req, res) => {
  sess = req.session;
  var username = req.body.username;
  var password = req.body.password;
  var user;
  sql.select(dbInfos, "*", "user",`where username = '${username}' and password = '${md5(password)}' `, (err, row) => {
  if (row !== undefined) {
    user = row[0];
    sess.logged = true ;
    sess.userInfo = user;
    res.redirect('/profile');

  }
  else {
    res.render('login.hbs', {
      reason : 'Wrong Password/Username'
  });
  }
  })

});

app.get('/register', (req, res) => {
  sess = req.session;
  if(sess.logged) {
    res.redirect('/profile');
  }
  else {
    res.render('register.hbs');
  }
});
app.post('/register', (req, res) => {
  sess = req.session;
  if(sess.logged) {
    res.render('/profile');
  }
  else {
  var username = req.body.username;
  var password = req.body.password;
  var passwordConf = req.body.passwordConfirmation;
  var email = req.body.email;
  var user = {
      username : username,
      password : md5(password),
      email : email
  };
  if( password !== passwordConf) {
    res.render('register.hbs', {
      reason : 'Passwords dont match'
    })
  }
  else {
    sql.insert(dbInfos, "user", user , (err, ok) => {
      if(ok) {
        res.render('register.hbs', {
          reason : 'Registation successfull! You can login now!'
        })
      }
      else {
        res.render('register.hbs', {
          reason : 'Registration unsuccessfull!'
        })
      }
    } )

  }
}});

app.get('/logout', (req, res) => {
  sess = req.session;
  if(sess.logged) {
    req.session.destroy(function(err) {
      if(err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
  }
  else {
    res.redirect('/')
  }
});

app.get('/profile', (req, res) => {
  sess = req.session;
  if (sess.logged) {
    res.render('profile.hbs',{
      username : sess.userInfo.username,
      rank : sess.userInfo.rank
    });
  }
  else {
    res.redirect('/');
  }
});

app.get('/createchal', (req, res) => {
  sess = req.session;
  if (sess.logged){
    res.render('createchal.hbs');
  }
  else {
    res.redirect('/login');
  }
});


app.post('/createchal', (req, res) => {
  sess = req.session;
  if (sess.logged) {
    var chalname;
    var description;
    var points;
    //handling file upload
    var form = new formidable.IncomingForm();
    form.multiples = true;

    form.on('field', function(name, field) {
        if (name === "challenge_name") {
          chalname = field;
          mkdirp(__dirname + '/../challenges/' + chalname);
          form.uploadDir = path.join(__dirname, '/../challenges/', chalname, '/');
      }
      if (name === "description") {
        description = field;
      }
      if (name === "points") {
        points = field;
      }
      });

    var newName = uuidv4() + '.txt';

    form.on('file', function(field, file) {
      fs.rename(file.path, path.join(form.uploadDir, newName));
    });

    form.on('error', function(err) {
      console.log('An error has occured: \n' + err);
    });

    form.on('end', function() {
      var chal = {
        chall_name : chalname,
        chall_description : description,
        chall_points : points,
        approved : '0',
        test_cases : newName
      }
      sql.insert(dbInfos, "chals", chal , (err, ok) => {
        if(err) {
          res.end('challenge not created');
        }

      });
      res.render('createchal.hbs',{
                message : 'Success! The challenge is created and waiting for admin approval'
              }
              );
    });

    form.parse(req);


  }
  else {
    res.redirect('/login');
  }
})

app.get('/challenges', (req, res) => {
  sql.select(dbInfos, "*", "chals","where approved = 1 ", (err, row) => {
  if (row !== undefined) {
    chals = row;
    console.log(row);
  }


})
});

app.listen(8081, () => {
  console.log('[+] Listening on port 8081 ! ')
});
