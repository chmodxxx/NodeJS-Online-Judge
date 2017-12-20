var {Submission} = require('../models/submission');
var {User} = require('../models/user');
var {mongoose} = require('../db/mongoose');
var functions = require('../functions');
var sanitize = require('mongo-sanitize');
const challdir = "/home/chmod/Desktop/node_app/challenges";



var getSubmissions = (request, response) => {
  sess = request.session;

  if(sess.logged){
  Submission.aggregate([
    {  $match  : { SubmissionUserID : mongoose.Types.ObjectId(sess.userInfo._id)  } },

            { $lookup : {
                from: "challenges",
                foreignField: "_id" ,
                localField: "SubmissionChallID",
                as: "chal"
                  }
              },
    { $sort : { _id: -1 } }

         ]).then((submissions) => {
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
    response.render('submissions.hbs', {
      submission : submissions
    });
  });
 }
  else {
    sess.origin = 'submissions';
    response.redirect('/login')
  }
}


var postSubmission = (request, response) => {
    sess = request.session;
    let logged = sess.logged;
    let chall = sess.chall[0];
    var lang, code, json, output, err, time, verdict, verdictdb;
    let langs = {
      'Python' : 0,
      'C' : 7,
      'C++' : 7 ,
      'Javascript' : 4
    };
    if(sess.logged) {
      lang = sanitize(request.body.lang);
      code = sanitize(request.body.code);

      let stdin = challdir + '/' + chall.ChallengeName + '/' + chall.ChallengeSTDIN;
      let stdout = challdir + '/' + chall.ChallengeName + '/' + chall.ChallengeSTDOUT;

      let apireturn = functions.apicompiler(langs[lang], code, stdin, stdout, sess, chall, logged);
      apireturn.then((JsonObject) => {
          console.log(JsonObject)
          let submission = new Submission({
                      SubmissionLang: lang,
                      SubmissionChallID: chall._id,
                      SubmissionVerdict: JsonObject.verdictdb,
                      SubmissionUserID: sess.userInfo._id,
          });
          submission.save();
          // User.where({ _id: sess.userInfo._id}).update({ $inc: { preferedlanguage: 1}}).exec();
          response.send(JSON.stringify({logged: JsonObject.logged, verdict: JsonObject.verdict}));
      });
    }

  else {
    sess.origin = 'chall_page';
    sess.origin.challid = chall.chall_id;
    response.redirect('/login');
  }
}

module.exports = {
  getSubmissions: getSubmissions,
  postSubmission: postSubmission
}
