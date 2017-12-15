var mongoose = require('mongoose');

var Challenge = mongoose.model('Challenge', {
  ChallengeName: {
    type: String,
    required: true,
  },
  ChallengeDescription: {
    type: String,
    required: true,
  },
  ChallengePoints: {
    type: Number,
    required: true,
    default: 0
  },
  ChallengeNbSolvers: {
    type: Number,
    default : 0,
  },
  ChallengeSTDIN: {
    type: String,
    required: true,
  },
  ChallengeSTDOUT: {
    type: String,
    required: true,

  },
  ChallengeTLE: {
    type: Number,
    required: true,

  },
  Approved: {
    type: Boolean,
    default: false,

  },

});

module.exports = {Challenge}
