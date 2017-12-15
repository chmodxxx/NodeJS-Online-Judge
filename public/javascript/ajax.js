function checkform() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  let passwordConfirmation = document.getElementById("passwordConfirmation").value;
  let email = document.getElementById("email").value;
  $.ajax({

       url : '/checkform',

       type : 'POST',

       data : {'username' : username,
               'password' : password,
               'passwordConfirmation' : passwordConfirmation,
               'email' : email
              },

       dataType : 'html',

       success : function(res, stat){
          let response = JSON.parse(res);
          for (var key in response) {
            if (response.hasOwnProperty(key)){
              document.getElementById(key).innerHTML = response[key];
            }
          }

       }

    });
}

function compile() {
  let lang = document.getElementById("lang").value;
  let code = document.getElementById("code").value;

  $.ajax({

      url : '/compile',
      type : 'POST',
      data : {'lang' : lang,
              'code' : code
              },

    dataType : 'html',

    success : function(res, stat) {
      let response = JSON.parse(res);
      document.getElementById('verdict').innerHTML = "Verdict : " + response['verdict'];
    }
    
  });

}
