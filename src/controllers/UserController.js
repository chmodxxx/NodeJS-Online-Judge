var sanitize = require("mongo-sanitize");
var {User} = require('../models/user');
var {mongoose} = require('../db/mongoose');
var md5 = require('md5');
var _ = require('lodash');


var getLogin = (request, response) => {
  sess = request.session;
  if (sess.logged) {
    response.redirect('/profile');
  }
  else {
  response.render("login.hbs");
  }
}

var postLogin = (request, response) => {
  sess = request.session;
  var redirect;
  if (sess.logged) {
    response.redirect('/profile');
  }
  else {
    var username = sanitize(request.body.username);
    var password = sanitize(request.body.password);
    var userobject;
    User.findOne({
      username: username,
      password: md5(password)
    }).then((user => {
      if (user !== null) {
        sess.userInfo = user;
        sess.logged = true;
        if(sess.origin !== undefined) {
          redirect = `/${sess.origin}`;
        }
        else {
          redirect = '/profile';
        }
        response.redirect(redirect);
      }
      else {
        response.render('login.hbs', {
          msg :' Wrong Password or Username'
        });
      }
    }));


  }
}


var getRegister = (request, response) => {
  sess = request.session;
  if(sess.logged) {
    response.redirect('/profile');
  }
  else {
    response.render('register.hbs');
  }
}

var postRegister = (request, response) => {
  sess = request.session;
  if(sess.logged) {
    response.render('/profile');
  }
  else {
    let username = sanitize(request.body.username);
    let password = sanitize(request.body.password);
    let passwordConf = sanitize(request.body.passwordConfirmation);
    let email = sanitize(request.body.email);
    let user =  new User({
        username: username,
        password: md5(password),
        email: email,
        chalsolved: []
      });
    if( password !== passwordConf) {
      response.render('register.hbs', {
        msg: 'Passwords dont match'
      })
    }
    else {
      user.save().then((user) => {
        if(user !== null) {
          response.render('register.hbs', {
            msg: 'Registration sucesfull! You can login now!'
          })
        }
        else {
          response.render('register.hbs', {
            msg: 'Registration unsuccesfull'
          });
        }
      });

    }
  }
}

var getProfile = (request, response) => {
  sess = request.session;
  var rank;
  if (sess.logged) {
    User.find(sess.userInfo).sort({ score: -1}).then((user) => {
      rank = user.findIndex(item => item.username === sess.userInfo.username) + 1 ;

    response.render('profile.hbs', {
      username : sess.userInfo.username,
      rank : rank
    });
  });
  }
  else {
    response.redirect('/');
  }
}

var getLogout = (request, response) => {
  sess = request.session;
  if(sess.logged) {
    request.session.destroy(function(err) {
      if(err) {
        console.log(err);
      } else {
        response.redirect('/');
      }
    });
  }
  else {
    response.redirect('/')
  }
}

var getScoreboard = (request, response) => {
  sess = request.session;
  var max;
  User.find().sort({ score: -1}).then((users) => {
    for(var i = 0; i < users.length; i++) {
      users[i].rank = i + 1 ;
      let obj = users[i].preferredlangs;
      max =  _.max(Object.keys(obj), function (o) { return obj[o]; });
      users[i].preferredlang = max;

    }

    response.render('scoreboard.hbs', {
      rows : users,
      logged : sess.logged
    });

  } );
}

module.exports = {
  getLogin: getLogin,
  postLogin: postLogin,
  getRegister: getRegister,
  postRegister: postRegister,
  getProfile: getProfile,
  getLogout: getLogout,
  getScoreboard: getScoreboard
}
