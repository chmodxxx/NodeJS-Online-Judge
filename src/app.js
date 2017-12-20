var express = require('express');
var hbs = require('hbs');
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');
var sanitize = require("mongo-sanitize");
var validator = require('validator');
var md5 = require('md5');
var request = require('request');
var morgan = require('morgan');
var UserController = require('./controllers/UserController.js');
var HomeController = require('./controllers/HomeController.js');
var ChallengeController = require('./controllers/ChallengeController.js');
var SubmissionController = require('./controllers/SubmissionController.js');
var sess = false;
var {mongoose} = require('./db/mongoose');
var {Challenge} = require('./models/challenge');
var {Submission} = require('./models/submission');

const challdir = "/home/chmod/Desktop/node_app/challenges";

// const accessLogStream = fs.createWriteStream(path.join('/home/chmod/Desktop/node_app/logs', 'access.log'), {flags: 'a'});

// getUserby({username: 'tes'}).then((user) => {console.log(typeof user);})// working






// app.post('/checkform', (req , res) => {
//   let username = req.body.username;
//   let password = req.body.password;
//   let passwordConfirmation = req.body.passwordConfirmation;
//   let email = req.body.email;
//
//   check({username: username,
//         password: password,
//         passwordConfirmation: passwordConfirmation,
//         email: email
//       }).then((response) => {
//         res.send(response);
//       })
//
//
// });

app = express();

hbs.registerPartials(__dirname + '/../views/partials')

app.use(session({secret: 'L337 STr!nG'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url " :status  ":user-agent"',  {stream: accessLogStream}));
app.use('/static', express.static('/home/chmod/Desktop/node_app/public'));

app.set('view engine', 'hbs');
app.set('views','/home/chmod/Desktop/node_app/views')




app.get('/', HomeController.getHome);
app.get('/login', UserController.getLogin);
app.post('/login', UserController.postLogin);
app.get('/register', UserController.getRegister);
app.post('/register', UserController.postRegister);
app.get('/logout', UserController.getLogout );
app.get('/profile', UserController.getProfile);

app.get('/createchal', ChallengeController.getCreatechal);
app.post('/createchal', ChallengeController.postCreatechal);
app.get('/challenge/:challID', ChallengeController.getChallenge);
app.get('/challenges', ChallengeController.getAllChallenges)


app.get('/submissions', SubmissionController.getSubmissions);
app.post('/compile', SubmissionController.postSubmission);

app.get('/scoreboard', UserController.getScoreboard);

app.listen(8090, () => {
  console.log('[+] Listening on port 8090 ! ');
});
