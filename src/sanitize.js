var validator = require('validator');

function isEmail(input){
  return validator.isEmail(input);
}

function isAlphanum(input) {
  return validator.isAlphanumeric(input);
}

function escape(input) {
  return validator.escape(input);
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
