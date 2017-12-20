var {Challenge} = require('../models/challenge');
var {mongoose} = require('../db/mongoose');
var sanitize = require('mongo-sanitize');
var formidable = require('formidable');
var mkdirp = require('mkdirp');
var path = require('path');
var {ObjectID} = require('mongodb');

const uuidv4 = require('uuid/v4');
const fs = require('fs');


var getCreatechal = (request, response) => {
  sess = request.session;
  if (sess.logged){
    response.render('createchal.hbs');
  }
  else {
    response.redirect('/login');
  }
}

var postCreatechal = (request, response) => {
  sess = request.session;
  if (sess.logged) {
    var chalname;
    var description;
    var points;
    var tle;

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
        if (chal !== null) {
          response.render('createchal.hbs', {
            message : 'Success! The challenge is created and waiting for admin approval'
            }
          );
        }
        else {
          response.end('Challenge not created');
        }

      });

    });

    form.parse(request);
  }
  else {
    sess.origin = 'createchal';
    response.redirect('/login');
  }
}

var getChallenge = (request , response) => {
  sess = request.session;
  let logged = sess.logged;
  var id = sanitize(request.params.challID);
  if (ObjectID.isValid(id)) {
    Challenge.find({_id: id}).then((challenge) => {
      if(challenge.length !== 0) {
        sess.chall = challenge;
        response.render('challengepage.hbs', {
          chall: challenge,
          logged: logged
        });
      }
      else {
        response.render('challenges.hbs', {
           message: 'No such Challenge'
         });
      }
    });
    }
  else {
    response.render('challenges.hbs', {
       message: 'Invalid Challenge ID'
     });
  }
}

var getAllChallenges = (request, response) => {
  sess = request.session;
  let logged = sess.logged;

  Challenge.find({Approved: true}).then((chals) => {
    if(chals !== null ){
      response.render('challenges.hbs', {
        chall: chals,
        logged: logged
      });
    }
   else {
      response.send('<b>No challenges are uploaded yet</b> Go back to <a href = "/">home</a>');
    }
 });
}

module.exports = {
  getCreatechal: getCreatechal,
  postCreatechal: postCreatechal,
  getChallenge: getChallenge,
  getAllChallenges: getAllChallenges
}
