var mysql = require('mysql');

connInfos = {
  host: "localhost",
  user: "phpmyadmin",
  password: "root",
  database : "main_db"
};

function Init(conninfos, callback){
  var con = mysql.createConnection(connInfos);
  con.connect(function(err) {
    if (err) callback(err);
  });
  callback(undefined, con);
}
function End(conn) {
  conn.end;
}

function Select(con, columns, table, additionnal = undefined, callback) {
  con.query(`SELECT ${columns} FROM ${table} ${additionnal}`, (err, rows) => {
    if (err) callback(err);
    callback(undefined, rows);
});
}

function Insert(con, table, object, callback){
  con.query(`INSERT into ${table} SET ?`, object, (err, res) => {
    if(err) callback(err);
    callback(undefined, 1);
  });
}

function Update(con, table, updatestatement , additionnal, callback) {
  con.query(`UPDATE ${table} set ${updatestatement} ${additionnal}`, (err , ok) => {
    if (err) {
      callback(err);
    }
    else {
      callback(undefined, 1);
    }
  })
}

module.exports = {
   connInfos : connInfos,
   Init : Init,
   Select : Select,
   Insert : Insert,
   Update : Update,
   End : End
};
// //missing delete & update
