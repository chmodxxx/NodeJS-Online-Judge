var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/judgedb', { useMongoClient: true });

module.exports = {mongoose};
