const schedule = require('node-schedule');
const MailService = require("./MailService");
var sql = require('mssql');
var config = require('../config');

//runs every night at 10pm
var attendanceCheck = schedule.scheduleJob('0 15 15 * * *', function(){
  var date = new Date();
  var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  console.log("Checking student attendance... " + str);
  var missedClasses;
  var student;

  try {
    sql.connect(config.db)
        .then(function(connection) {
            new sql.Request(connection)
                .query("SELECT * FROM Attendance ORDER BY date DESC")
                .then(function(attendanceResult) {
                    new sql.Request(connection)
                        .query("SELECT * FROM Students")
                        .then(function(studentsResult) {
                          missedClasses = [];
                          for (let item of attendanceResult) {
                            var attendanceDate = new Date();
                            attendanceDate = item.date;
                            var formattedDate = attendanceDate.getDate();
                            if (item.attendanceValue === 'A' && formattedDate === date.getDate()) {
                              missedClasses.push(item);
                            }
                          }
                          if (missedClasses) {
                            for (let item of missedClasses) {
                              student = studentsResult.filter(x => x.userID === item.userID);
                              let mailOptions = {
                                from: '"Test" <ghost@test.com>', // sender address
                                to: student[0].email, // list of receivers
                                subject: 'SCHEDULER ✔', // Subject line
                                text: '', // plain text body
                                html: '<b> Hi ' + student[0].firstName + '!</b><br  />You have been absent from <insert class name here> for two or more classes in a row.' + item.date + '' // html body
                              };
                              //new MailService().scheduledMessage(mailOptions);
                            }
                            let mailOptionsAdmin = {
                              from: '"Test" <academic.career.prep@gmail.com>', // sender address
                              to: 'nicholasrowlandson@gmail.com', // list of receivers
                              subject: 'SCHEDULER ✔', // Subject line
                              text: '', // plain text body
                              html: '<b> Hi admin!</b><br  />There were ' + missedClasses.length + ' emails sent out due to missed classes.' // html body
                            };
                            new MailService().sendMessage("Scheduled Message", mailOptionsAdmin);
                            console.log("TOTAL EMAILS SENT: " + missedClasses.length);
                          } else {
                            console.log("No missed classes");
                          }
                        }).catch(function(err) {
                            console.log("Get all attendance " + err);
                        });
                }).catch(function(err) {
                    console.log("Get all attendance " + err);
                });
        }).catch(function(err) {
            console.log(err);
        });
  }
  catch (err) {
      console.log(err);
  }

});
