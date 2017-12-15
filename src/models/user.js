var mongoose = require('mongoose');

var User = mongoose.model('User', {
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  isadmin: {
    type: Boolean,
    default: false,
  },
  score: {
    type : Number,
    default : 0,
  },
  chalsolved: {
    type: Array,
    default: []
  },

});

module.exports = {User}
