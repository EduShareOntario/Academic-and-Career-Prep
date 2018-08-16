import moment = require("moment");
var sql = require('mssql');
var config = require('../config');
const db = config.db;

class ActivityService {

reportActivity(type, action, result, affectedID, facultyID, info) {
  var CurrentDate = moment().format();
  sql.connect(db)
    .then(function(connection) {
      new sql.Request(connection)
      .query("INSERT INTO SiteActivity VALUES ('" + type + "', '" + affectedID + "', '" + facultyID + "', '" + CurrentDate + "','" + action + "','" + result + "','" + info + "')")
        .then(function(user) {
        }).catch(function(err) {
          console.log("Error - Insert new record into activity table: " + err);
        });
    }).catch(function(err) {
      console.log("DB Connection error - Insert new record into activity table: " + err);
    });
    if((type === 'student' || type === 'client') && affectedID !== null) {
      sql.connect(db)
        .then(function(connection) {
          new sql.Request(connection)
            .query("INSERT INTO CaseNotes VALUES ('" + affectedID + "', '" + facultyID + "', '" + info + "', '" + moment().format('YYYY-MM-DD HH:mm:ss a') + "')")
            .then(function() {
            }).catch(function(err) {
              console.log("Error - Insert new note " + err);
            });
        }).catch(function(err) {
          console.log("DB Connection error: " + err);
        });
    }
}


}
export = ActivityService;
