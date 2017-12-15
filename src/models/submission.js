var mongoose = require('mongoose');

var Submission = mongoose.model('Submission', {
  SubmissionLang: {
    type: String,
  },
  SubmissionChallID: {
    type: mongoose.Schema.ObjectId,
  },
  SubmissionVerdict: {
    type: String,
  },
  SubmissionUserID: {
    type : mongoose.Schema.ObjectId,
  }

});

module.exports = {Submission}
