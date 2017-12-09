var validator = require('validator');

function isEmail(input){
  return validator.isEmail(String(input));
}

function isAlphanum(input) {
  return validator.isAlphanumeric(String(input));
}

function escape(input) {
  return validator.escape(String(input));
}

function isNumeric(input){
  return validator.isNumeric(String(input));
}

module.exports = {
  isEmail : isEmail,
  isAlphanum : isAlphanum,
  escape : escape,
  isNumeric : isNumeric
};
