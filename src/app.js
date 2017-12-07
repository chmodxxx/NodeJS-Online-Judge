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
var request = require('request');
var sess = false;
const dbInfos = db.connInfos;
const uuidv4 = require('uuid/v4');
const challdir = "/home/chmod/Desktop/node_app/challenges";

function updatesubmission(verdict, challid, userid, dbinfos, time, lang){
  let submission = {
    submission_challid : challid,
    submission_userid : userid,
    verdict : verdict,
    submission_time : time,
    lang : lang
  };

  sql.insert(dbInfos, "submission", submission , (err, ok) => {
    if(ok) {
      return 1;
    }
    else return 0;

  });
}
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
    var tle;
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
      if (name == "timelimit") {
        tle = field;
      }
      });

    var newName1 = uuidv4() + '_stdin' + '.txt';
    var newName2 = uuidv4() + '_stdout' + '.txt'
    form.on('file', function(field, file) {
      if (field === 'stdin') {
      fs.rename(file.path, path.join(form.uploadDir, newName1));
      }
      else {
        fs.rename(file.path, path.join(form.uploadDir, newName2));
      }

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
        chall_stdin : newName1,
        chall_stdout : newName2,
        chall_timelimit : tle
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
    sess.origin = 'create_chal';
    res.redirect('/login');
  }
})

app.get('/challenges', (req, res) => {
  sess = req.session;
  var logged = sess.logged;
  var chals ;
  sql.select(dbInfos, "*", "chals","where approved=1 ", (err, rows) => {
  if (rows !== undefined) {
    chals = rows;
    res.render('challenges.hbs' , {
      chall : chals,
      logged : logged
    })
  }
  else {
    res.send('<b>No challenges are uploaded yet</b> Go back to <a href = "/">home</a>')
  }


})
});

app.get('/chall_page', (req, res) => {
  res.render('challenges.hbs', {
    message : 'You need to specify a challenge'
  });
})
app.get('/chall_page/:challID', (req, res) => {
  sess = req.session;
  let logged = sess.logged;
  var id = req.params.challID;
  var chal;
  if (sanitize.isNumeric(id) && id > 0) {
    sql.select(dbInfos, "*", "chals",`where chall_id=${id}`, (err, row) => {
        if (row !== undefined) {
          chal = row[0];
          sess.chall = chal;

          res.render('chall_page.hbs', {
            chall : chal,
            logged : logged
          });
        }
    });

    }


  else {
    res.render('challenges.hbs', {
        message : 'Invalid Challenge ID'
    });

    }

});

app.post('/chall_page', (req, res) => {
  sess = req.session;
  let logged = sess.logged;
  var chall = sess.chall;
  var lang;
  var code;
  var json;
  var output;
  var err;
  var time;
  var verdict;
  var submissionTime;
  var update = false;
  let langs = {
    'python' : 0,
    'c' : 7,
    'cpp' : 7 ,
    'javascript' : 4
  };
  if(sess.logged) {
      lang = req.body.lang;
      code = req.body.code;

      let stdin = challdir + '/' + chall.chall_name + '/' + chall.chall_stdin;
      let stdout = challdir + '/' + chall.chall_name + '/' + chall.chall_stdout;

      fs.readFile(stdin, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        json = {
          language : langs[lang],
          stdin : data,
          code : code
        };
        request.post({
              url: 'http://127.0.0.1:8080/compile',
              form:  json
          },
          function (err, httpResponse, body) {
              submissionTime = new Date(Date.now());
              body = JSON.parse(body);
              err = body['errors'];
              output = body['output'];
              time = body['time'];

              if (time > chall.chall_timelimit ) {
                verdict = "Time Limit Exceeded";
                res.render('chall_page.hbs', {
                  verdict : 'Time limit exceeded',
                  logged : logged
                });
              }
              else if(err !== '') {
                verdict = "Compilation Error";
                res.render('chall_page.hbs' , {
                  verdict : 'Compilation Error',
                  logged : logged
                });
              }

              else {
                fs.readFile(stdout, 'utf8', function (err,data) {
                  if (err) {
                    return console.log(err);
                  }
                  else {
                    if(output === data) {
                      verdict = "Accepted";
                      res.render('chall_page.hbs', {
                        verdict : 'Accepted',
                        logged : logged
                      });
                    }
                    else {
                      verdict = "Wrong Answer";
                      res.render('chall_page.hbs', {
                        verdict : 'Wrong Answer',
                        logged : logged
                      });
                    }
                    update = true;
                  }
              if(update) updatesubmission(verdict, chall.chall_id, sess.userInfo.id, dbInfos, submissionTime, lang)});
            }
            if (!update) updatesubmission(verdict, chall.chall_id, sess.userInfo.id, dbInfos, submissionTime, lang);
        });

  });

}

  else {
    sess.origin = 'chall_page';
    sess.origin.challid = chall.chall_id;
    res.redirect('/login');
  }
})

app.get('/submissions', (req, res) => {
  sess = req.session;
  if(sess.logged){
  sql.select(dbInfos, 'submission.lang, submission.verdict, submission.submission_time, chal.chall_name, chal.chall_id', 'submission submission' , `left join chals chal on chal.chall_id=submission.submission_challid where submission_userid=${sess.userInfo.id} ` , (err, row) => {
    if (row !== undefined) {
      let submissions = row;
      console.log(submissions);
      res.render('submissions.hbs', {
        submission : submissions
      });
    }

  else {
    res.render('submissions.hbs', {
      msg : "You have no submissions"
    });
  }
});
}
  else {
    sess.origin = 'submissions';
    res.redirect('/login')
  }
});
app.listen(8082, () => {
  console.log('[+] Listening on port 8082 ! ')
});
