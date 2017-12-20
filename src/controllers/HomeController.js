
var getHome = (request, response) => {
  sess = request.session;
  if (sess.logged) {
    response.render('home.hbs' , {
      logged : true
    });
  }
  else {
    response.render('home.hbs', {
      logged : false
    })
  }
}

module.exports = {
  getHome: getHome
};
