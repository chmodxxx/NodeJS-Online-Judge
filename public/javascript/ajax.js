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
