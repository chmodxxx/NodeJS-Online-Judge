var db = require('./db.js');
const dbInfos = db.connInfos;

function select(dbInfos = dbInfos, columns, table, additionnal = undefined , callback) {
    var con = db.Init(dbInfos,(err, con) => {
      if (err) console.log(err);
      else {
          db.Select(con, columns, table, additionnal ,(err,row) => {
            if (err)
            {
              callback(0);
            }
            else if (row.length === 0 ) {
              callback(1)
            }
            else
            {
              callback(undefined,row);
            }})
          }
      });
  }

function insert(dbInfos = dbInfos, table, object, callback) {
    var con = db.Init(dbInfos,(err, con) => {
      if (err) console.log(err);
      else {
        db.Insert(con, table, object ,(err,ok) => {
          if (err)
          {
            callback(err);
          }
          else
          {
            callback(undefined,ok);
          }})
        }
      });
  }

module.exports = {
  select : select,
  insert : insert
};
