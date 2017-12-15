var express = require('express');
var hbs = require('hbs');
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');
var formidable = require('formidable');
var path = require('path');
var mkdirp = require('mkdirp');
var sanitize = require("mongo-sanitize");
var md5 = require('md5');
var request = require('request');
var morgan = require('morgan');
var sess = false;
var {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Challenge} = require('./models/challenge');
var {Submission} = require('./models/submission');

const uuidv4 = require('uuid/v4');
const challdir = "/home/chmod/Desktop/node_app/challenges";
const accessLogStream = fs.createWriteStream(path.join('/home/chmod/Desktop/node_app/logs', 'access.log'), {flags: 'a'});

//
// function updateSubmission(verdict, challid, userid, dbinfos, time, lang){
//   let submission = {
//     submission_challid : challid,
//     submission_userid : userid,
//     verdict : verdict,
//     submission_time : time,
//     lang : lang
//   };
//
//   sql.insert(dbInfos, "submission", submission , (err, ok) => {
//     if(ok) {
//       return 1;
//     }
//     else return 0;
//
//   });var {User} = require('./models/user');

// }
//
// function checkPassword(password) {
//   var returnMessage ;
//   if (password.length < 6) {var {User} = require('./models/user');
//
//     returnMessage = "Password should have at least 6 characters";
//   }var {User} = require('./models/user');
//
//   else if (password.length >= 36) {
//     returnMessage = "Password too long";
//   }
//   else if (password.search(/\d/) === -1) {
//     returnMessage = "Password should contain some numbers";
//   }
//   else if (password.search(/[A-Z]/) === -1) {var {User} = require('./models/user');
//
//     returnMessage = "Password should contain an uppercase character";
//   }
//   else returnMessage = "";
//
//   return returnMessage;
// }

function apicompiler() {
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

          if (time > chall.ChallengeTLE) {
            verdict = "Time Limit Exceeded";
            verdictdb = verdict;
            res.send(JSON.stringify({logged : logged, verdict : verdict}));
          }
          else if(err !== '') {
            verdict = "Compilation Error";
            verdictdb = verdict;
            res.send(JSON.stringify({logged : logged, verdict : verdict}));
          }

          else {
            fs.readFile(stdout, 'utf8', function (err,data) {
              if (err) {
                return console.log(err);
              }
              else {
                if(output === data) {
                  verdict = "Accepted";
                  verdictdb = verdict;
                  let solved = sess.userInfo.chalsolved;

                  if (solved.indexOf(chall._id) !== -1) {
                    alreadysolved = true;
                  }
                  else {
                    solved.push(chall._id);
                  }
                  if(!alreadysolved){
                    try {
                      Challenge.where({ _id: chall._id}).update({ $inc: { ChallengeNbSolvers: 1}}).exec();
                      User.where({ _id: sess.userInfo._id}).update({
                        $inc: { score: chall.ChallengePoints },
                        $set: { chalsolved: solved }
                      }).exec();
                      verdict = `Accepted! you gained ${chall.ChallengePoints} `;
                    }
                    catch (e) {
                      verdict = 'Oops something went wrong';
                    }


                  }
                else {
                    verdict = "Accepted! but you already solved this challenge";
                    verdictdb = "Accepted"
                  }
                  res.send(JSON.stringify({logged : logged, verdict : verdict}));
                }
                else {
                  verdict = "Wrong Answer";
                  verdictdb = verdict;
                  res.send(JSON.stringify({logged : logged, verdict : verdict}));
                }

              }
            });
          }
    });
  });
}

app = express();

hbs.registerPartials(__dirname + '/../views/partials')

app.use(session({secret: 'L337 STr!nG'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));var {User} = require('./models/user');

app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url " :status  ":user-agent"',  {stream: accessLogStream}));
app.use('/static', express.static('/home/chmod/Desktop/node_app/public'));

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

// app.post('/checkform', (req , res) => {
//   let username = req.body.username;
//   let password = req.body.password;
//   let passwordConfirmation = req.body.passwordConfirmation;
//   let email = req.body.email;
//
//   let response = {
//     usernameValid : "Username can't be empty",
//     passwordValid : "Password  can't be empty",
//     passwordsMatch : "",
//     emailValid :  "Email can't be empty"
//   };
//
//         response.usernameValid = "Username is already used";
//       }
//     })
//
//   }
//   if(password !== "") {
//     response.passwordValid = checkPassword(password);
//   }
//   if (passwordConfirmation !== password) {
//     response.passwordsMatch = "Passwords don't match";
//   }
//   if(email !== "") {
//     response.emailValid = "";
//   }
//   if (!sanitize.isEmail(email)){
//     response.emailValid = "Email Format invalid";
//   }
//   else {
//     sql.select(dbInfos, "*", "user" , `where email = '${email}'`, (err, row) => {
//     if (row !== undefined) {
//       response.emailValid = "Email already used";
//     }
//     else {
//       response.emailValid = "Email is valid";
//     }
//     }
//   );
//   }
//
//   res.send(response);
// });

app.post('/login', (req, res) => {
  sess = req.session;
  var username = sanitize(req.body.username);
  var password = sanitize(req.body.password);
  var userobject;
  User.findOne({
    username: username,
    password: md5(password)
  }).then((user => {
    if (user !== null) {
      sess.userInfo = user;
      sess.logged = true;
      res.redirect('/profile');
    }
    else {
      res.render('login.hbs', {
        reason :' Wrong Password or Username'
      });
    }
  }));


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
  var username = sanitize(req.body.username);
  var password = sanitize(req.body.password);
  var passwordConf = sanitize(req.body.passwordConfirmation);
  var email = sanitize(req.body.email);
  var user =  new User({
      username : username,
      password : md5(password),
      email : email,
      chalsolved : []
  });
  if( password !== passwordConf) {
    res.render('register.hbs', {
      reason : 'Passwords dont match'
    })
  }
  else {
    user.save().then((user) => {
      if(user !== null) {
        res.render('register.hbs', {
        reason : 'Registration sucesfull! You can login now!'
      })
    }
    else {
      res.render('register.hbs', {
        reason : 'Registration unsuccesfull'
      });
    }
    });

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
  var rank;
  if (sess.logged) {
    User.find(sess.userInfo).sort({ score: -1}).then((user) => {
      rank = user.findIndex(item => item.username === sess.userInfo.username) + 1 ;

    res.render('profile.hbs', {
      username : sess.userInfo.username,
      rank : rank
    });
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
          chalname = sanitize(field);
          mkdirp(__dirname + '/../challenges/' + chalname);
          form.uploadDir = path.join(__dirname, '/../challenges/', chalname, '/');
      }
      if (name === "description") {
        description = sanitize(field);
      }
      if (name === "points") {
        points = sanitize(field);
      }
      if (name == "timelimit") {
        tle = sanitize(field);
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
      var chal = new Challenge({
        ChallengeName : chalname,
        ChallengeDescription : description,
        ChallengePoints : points,
        ChallengeSTDIN : newName1,
        ChallengeSTDOUT : newName2,
        ChallengeTLE : tle
      });
      chal.save().then((chal) => {
        if(chal !== null) {
          res.render('createchal.hbs', {
            message : 'Success! The challenge is created and waiting for admin approval'
            }
          );

        }
        else {
          res.end('Challenge not created');
        }

      });

    });

    form.parse(req);
  }
  else {
    sess.origin = 'create_chal';
    res.redirect('/login');
  }
});

app.get('/challenges', (req, res) => {
  sess = req.session;
  var logged = sess.logged;

  Challenge.find({Approved: true}).then((chals) => {
    if(chals !== null ){
      res.render('challenges.hbs', {
        chall: chals,
        logged: logged
      });

    }
    else {
       res.send('<b>No challenges are uploaded yet</b> Go back to <a href = "/">home</a>');
    }
  });
});

app.get('/chall_page', (req, res) => {
  res.render('challenges.hbs', {
    message: 'You need to specify a challenge'
  });
});

app.get('/chall_page/:challID', (req, res) => {
  sess = req.session;
  let logged = sess.logged;
  var id = sanitize(req.params.challID);
  if (ObjectID.isValid(id)) {
    Challenge.find({_id: id}).then((challenge) => {

      if(challenge.length !== 0) {
        sess.chall = challenge;

        res.render('chall_page.hbs', {
          chall: challenge,
          logged: logged
        });
      }
      else {
        res.render('challenges.hbs', {
           message: 'No such Challenge'
         });
      }
    });
    }
  else {
    res.render('challenges.hbs', {
       message: 'Invalid Challenge ID'
     });
  }

});

app.post('/compile', (req, res) => {
  sess = req.session;
  let logged = sess.logged;
  var chall = sess.chall[0];
  var lang;
  var code;
  var json;
  var output;
  var err;
  var time;
  var verdict;
  var verdictdb;
  var update = false;
  let alreadysolved = false;
  let langs = {
    'Python' : 0,
    'C' : 7,
    'C++' : 7 ,
    'Javascript' : 4
  };
  if(sess.logged) {
      lang = sanitize(req.body.lang);
      code = sanitize(req.body.code);

      let stdin = challdir + '/' + chall.ChallengeName + '/' + chall.ChallengeSTDIN;
      let stdout = challdir + '/' + chall.ChallengeName + '/' + chall.ChallengeSTDOUT;

      // apicompiler(); need to turn this into a single function

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
                body = JSON.parse(body);
                err = body['errors'];
                output = body['output'];
                time = body['time'];

                if (time > chall.ChallengeTLE) {
                  verdict = "Time Limit Exceeded";
                  verdictdb = verdict;
                  res.send(JSON.stringify({logged: logged, verdict: verdict}));
                }
                else if(err !== '') {
                  verdict = "Compilation Error";
                  verdictdb = verdict;
                  res.send(JSON.stringify({logged: logged, verdict: verdict}));
                }
              
                else {
                  fs.readFile(stdout, 'utf8', function (err, data) {
                    if (err) {
                      return console.log(err);
                    }
                    else {
                      if(output === data) {
                        verdict = "Accepted";
                        let solved = sess.userInfo.chalsolved;

                        if (solved.indexOf(chall._id) !== -1) {
                          alreadysolved = true;
                        }
                        else {
                          solved.push(chall._id);
                        }
                        if(!alreadysolved){
                          try {
                            Challenge.where({ _id: chall._id}).update({ $inc: { ChallengeNbSolvers: 1}}).exec();
                            User.where({ _id: sess.userInfo._id}).update({
                              $inc: { score: chall.ChallengePoints },
                              $set: { chalsolved: solved }
                            }).exec();
                            verdict = 'Accepted';
                            verdictdb = verdict;
                          }
                          catch (e) {
                            verdict = 'Oops something went wrong';
                          }
                        }
                      else {
                          verdict = "Accepted! but you already solved this challenge";
                          verdictdb = "Accepted";
                        }
                      }
                      else {
                        verdict = "Wrong Answer";
                        verdictdb = verdict;
                      }
                      res.send(JSON.stringify({logged : logged, verdict : verdict}));

                    }
                  });
                }

                let submission = new Submission({
                      SubmissionLang: lang,
                      SubmissionChallID: chall._id,
                      SubmissionVerdict: verdictdb,
                      SubmissionUserID: sess.userInfo._id,
                });
                submission.save();
          });
        });

}

  else {
    sess.origin = 'chall_page';
    sess.origin.challid = chall.chall_id;
    res.redirect('/login');
  }
});

app.get('/submissions', (req, res) => {
  sess = req.session;

  if(sess.logged){
  Submission.aggregate([
    {  $match  : { SubmissionUserID : mongoose.Types.ObjectId(sess.userInfo._id)  } },

            { $lookup : {
                from: "challenges",
                foreignField: "_id" ,
                localField: "SubmissionChallID",
                as: "chal"
           }

  }]).then((submissions) => {
    for (var i = 0 ; i < submissions.length; i++) {
      if (submissions[i].SubmissionVerdict.indexOf('Accepted') >= 0) {
        submissions[i].truth = true;
      }
      else {
        submissions[i].truth = false;
      }
      submissions[i].challName = submissions[i].chal[0].ChallengeName;
      submissions[i].time = mongoose.Types.ObjectId(submissions[i]._id).getTimestamp();
    }
    res.render('submissions.hbs', {
      submission : submissions
    });
  });
 }
  else {
    sess.origin = 'submissions';
    res.redirect('/login')
  }
});

app.get('/scoreboard', (req, res) => {
  sess = req.session;
  User.find().sort({ score: -1}).then((users) => {
    for(var i = 0; i < users.length; i++) {
      users[i].rank = i + 1 ;
    }
    res.render('scoreboard.hbs', {
      rows : users,
      logged : sess.logged
    });

  } );

});

app.listen(8090, () => {
  console.log('[+] Listening on port 8090 ! ');
});
