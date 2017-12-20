var request = require('request');
var {Challenge} = require('./models/challenge');
var {Submission} = require('./models/submission');
var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var fs = require('fs');
//
//
// function getUserby(JsonObject, callback){
//       User.find(JsonObject).then((user) =>  {
//       if (user !== null) {
//         callback(user);
//       }
//       else {
//         callback(null);
//       }
//     });
//
// }
//
// var check = (Userobject) => {
//   return new Promise((resolve, reject) => {
//   let response = {
//     usernameValid : "Username can't be empty",
//     passwordValid : "Password  can't be empty",
//     passwordsMatch : "",
//     emailValid :  "Email can't be empty"
//   };
//   if (Userobject.username !== "") {
//     response.usernameValid = "";
//     }
//   if(!validator.isAlphanumeric(Userobject.username)) {
//     response.usernameValid = "Only alphanum chars";
//     }
//     getUserby({username: Userobject.username}, (user) => {
//       if(user.length === 0){
//         response.usernameValid = "xd";
//       }
//       else {
//         response.usernameValid = "Username already used";
//       }
//     });
//   if (Userobject.password !== "" && Userobject.passwordConfirmation !== Userobject.password) {
//       response.passwordValid = ""
//       response.passwordsMatch = "Passwords don't match";
//
//     }
//   if (Userobject.email !== "") {
//       response.emailValid = "";
//       }
//
//   if(!validator.isEmail(Userobject.email)) {
//         response.emailValid = "Email format invalid";
//       }
//   else {
//         getUserby({email: Userobject.email}, (user) => {
//           if(user.length === 0) {
//             response.emailValid = "";
//           }
//           else {
//             response.emailValid = "Email already used";
//           }
//         });
//       }
//       resolve(response);
//     })
//
//   }
//
//
//   function checkPassword(password) {
//     var returnMessage ;
//     if (password.length < 6) {var {User} = require('./models/user');
//
//       returnMessage = "Password should have at least 6 characters";
//     }
//
//     else if (password.length >= 36) {
//       returnMessage = "Password too long";
//     }
//
//     else if (password.search(/\d/) === -1) {
//       returnMessage = "Password should contain some numbers";
//     }
//
//     else if (password.search(/[A-Z]/) === -1) {var {User} = require('./models/user');
//
//       returnMessage = "Password should contain an uppercase character";
//     }
//
//     else returnMessage = "";
//
//     return returnMessage;
//   }



var apicompiler = function(lang, code, stdin, stdout, sess, chall, logged) {
    return new Promise((resolve, reject) => {
    let alreadysolved = false;
    fs.readFile(stdin, 'utf8', function (err,data) {
      if (err) {
        reject(console.log(err));
      }
      json = {
        language : lang,
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
              resolve({logged: logged, verdict: verdict, verdictdb: verdictdb});
            }
            else if(err !== '') {
              verdict = "Compilation Error";
              verdictdb = verdict;
              resolve({logged: logged, verdict: verdict, verdictdb: verdictdb});
            }

            else {
              fs.readFile(stdout, 'utf8', function (err,data) {
                if (err) {
                  reject(console.log(err));
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
                    resolve({logged: logged, verdict: verdict, verdictdb: verdictdb});
                  }
                  else {
                    verdict = "Wrong Answer";
                    verdictdb = verdict;
                    resolve({logged: logged, verdict: verdict, verdictdb: verdictdb});
                  }

                }
              });
            }
      });
    });
  })
}

module.exports = {
  apicompiler: apicompiler
}
