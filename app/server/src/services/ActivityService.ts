var sql = require('mssql');
var config = require('../config');
const db = config.db;

class ActivityService {

reportActivity(action, result, userID, info) {
  var timestamp = new Date();
  sql.connect(db)
    .then(function(connection) {
      new sql.Request(connection)
      .query("INSERT INTO ActivityReport VALUES ('" + userID + "', '" + timestamp + "','" + action + "','" + result + "','" + info + "')")
        .then(function(user) {
        }).catch(function(err) {
          console.log("Error - Insert new record into activity table: " + err);
        });
    }).catch(function(err) {
      console.log("DB Connection error - Insert new record into activity table: " + err);
    });
}


}
export = ActivityService;