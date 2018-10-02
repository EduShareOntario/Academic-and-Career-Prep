const schedule = require('node-schedule');
const MailService = require("./MailService");
const ActivityService = require("./ActivityService");
var sql = require('mssql');
var config = require('../config');

//runs every night at 7:30pm
var attendanceCheck = schedule.scheduleJob('0 36 16 * * *', function() {
var date = new Date();
var twoMissedClasses = 0, fourMissedClasses = 0;
var student;

try {
  sql.connect(config.db)
  .then(function(connection) {
    new sql.Request(connection)
    .query("SELECT * FROM Attendance ORDER BY date DESC")
    .then(function(attendanceResult) {
      new sql.Request(connection)
      .query("SELECT userID, firstName, lastName FROM Students")
      .then(function(studentsResult) {
        new sql.Request(connection)
        .query("SELECT userID, email FROM Users")
        .then(function(usersResult) {
          new sql.Request(connection)
          .query("SELECT courseID, courseName FROM Course")
          .then(function(coursesResult) {
            for (let student of studentsResult) {
              var userInfo = usersResult.filter(x => x.userID === student.userID);
              var studentAttendance = attendanceResult.filter(x => x.userID === student.userID);
              console.log("# of attendance records for " + student.firstName + ": " + studentAttendance.length);
              function courseBy(array, f) {
                var courses = {};
                array.forEach(function(o) {
                  var course = JSON.stringify(f(o));
                  courses[course] = courses[course] || [];
                  courses[course].push(o);
                });
                return Object.keys(courses).map(function(course) {
                  return courses[course];
                })
              }
              var result = courseBy(studentAttendance, function(item) {
                return [item.courseID, item.userID];
              });
              for (let course of result) {
                for (var i = 0; i < course.length - 1; i++) {
                  var availableCourses = course.filter(x => x.fourMissedClassMsg === false);
                  if (availableCourses.length >= 4 && course[i + 1] != null && course[i + 2] != null && course[i + 3] != null) {
                    if (course[i].fourMissedClassMsg === false &&
                      course[i + 1].fourMissedClassMsg === false &&
                      course[i + 2].fourMissedClassMsg === false &&
                      course[i + 3].fourMissedClassMsg === false &&
                      course[i].attendanceValue === 'A' &&
                      course[i + 1].attendanceValue === 'A' &&
                      course[i + 2].attendanceValue === 'A' &&
                      course[i + 3].attendanceValue === 'A') {
                        //mark attendance records as reviewed and message sent
                        course[i].fourMissedClassMsg = true;
                        course[i + 1].fourMissedClassMsg = true;
                        course[i + 2].fourMissedClassMsg = true;
                        course[i + 3].fourMissedClassMsg = true;
                        course[i].twoMissedClassMsg = true;
                        course[i + 1].twoMissedClassMsg = true;
                        course[i + 2].twoMissedClassMsg = true;
                        course[i + 3].twoMissedClassMsg = true;
                        var courseInfo = coursesResult.filter(x => x.courseID === course[i].courseID);
                        console.log("__________________________________________________________________________________________");
                        console.log("Four consecutive classes missed by: " + student.firstName + " " + student.lastName);
                        console.log("Student ID: " + course[i].userID + " - " + course[i + 1].userID);
                        console.log("Dates: " + course[i].date + ' & ' + course[i + 1].date + ' & ' + course[i + 2].date + ' & ' + course[i + 3].date);
                        console.log("Course ID: " + course[i].courseID + " - " + course[i + 1].courseID);
                        console.log("Email: " + userInfo[0].email);
                        console.log("__________________________________________________________________________________________");
                        fourMissedClasses += 1;
                        let mailOptions = {
                          from: config.mail.user, // sender address
                          to: userInfo[0].email, // list of receivers
                          subject: 'Removal from ' + courseInfo[0].courseName, // Subject line
                          text: '', // plain text body
                          html: 'Hi ' + student.firstName + ',<br /><br />Our records indicate that you have missed 50% or more of your ' + courseInfo[0].courseName +
                          ' classes in the last four weeks. Our policy states that students will be withdrawn when this much time has been missed. Unfortunately, ' +
                          'this means that you are being exited from ' + courseInfo[0].courseName + ' class.<br /><br />Please contact me by phone at 705-728-1968, Ext. XXXX or by ' +
                          'email at <a>Cheryl.Boyes@GeorgianCollege.ca</a> to complete the necessary paperwork and discuss possible opportunities for returning to the ' +
                          courseInfo[0].courseName + ' class at a later date.<br /><br />Regards,<br /><br /><strong>Cheryl Boyes</strong><br /><strong>Academic Upgrading Officer</strong>' +
                          '<br />Georgian College| One Georgian Drive | Barrie ON | L4M 3X9' // html body
                        };
                        var query = "UPDATE Attendance SET fourMissedClassMsg = 'true', twoMissedClassMsg = 'true' WHERE attendanceID IN" +
                        " ('" + course[i].attendanceID + "','" + course[i + 1].attendanceID + "','" + course[i + 2].attendanceID + "','" + course[i + 3].attendanceID + "')";
                        new sql.Request(connection)
                        .query(query)
                        .then(function(result) {
                          new MailService().sendMessage('Four Missed Classes', mailOptions);
                          new ActivityService().reportActivity('scheduledEmails', 'Four Missed Classes', 'success', student.userID, '', student.firstName + ' ' + student.lastName + ' has missed four consecutive classes for the following course: ' + courseInfo[0].courseName);
                        }).catch(function(err) {
                          console.log("Update attendance records: " + err);
                        });
                      }
                    }
                    if (course.length >= 2 && course[i + 1] != null) {
                      if (course[i].attendanceValue === 'A' &&
                      course[i + 1].attendanceValue === 'A' &&
                      course[i].twoMissedClassMsg === false &&
                      course[i + 1].twoMissedClassMsg === false) {
                        //mark attendance records as reviewed and message sent
                        course[i].twoMissedClassMsg = true;
                        course[i + 1].twoMissedClassMsg = true;
                        var courseInfo = coursesResult.filter(x => x.courseID === course[i].courseID);
                        console.log("__________________________________________________________________________________________");
                        console.log("Two consecutive classes have been missed by: " + student.firstName + " " + student.lastName);
                        console.log("Student ID: " + student.userID);
                        console.log("Dates: " + course[i].date + ' & ' + course[i + 1].date);
                        console.log("Course ID: " + course[i].courseID + " - " + course[i + 1].courseID);
                        console.log("Email: " + userInfo[0].email);
                        console.log("__________________________________________________________________________________________");
                        twoMissedClasses += 1;
                        let mailOptions = {
                          from: config.mail.user, // sender address
                          to: userInfo[0].email, // student.email
                          subject: 'Two Missed ' + courseInfo[0].courseName + ' Classes', // Subject line
                          text: '', // plain text body
                          html: 'Hi ' + student.firstName + ',<br /><br />I noticed that you missed the last two consecutive ' + courseInfo[0].courseName + ' classes.' +
                          ' I hope everything is okay. Let me know if there is something I can do to help.<br /><br />Please be reminded of our program ' +
                          'policy that states students are responsible to notify their instructors when they will be absent. In addition, the policy directs ' +
                          'students to arrange for a leave of absence if they need to miss two or more classes in a row. A leave of absence can be arranged with ' +
                          'Cheryl Boyes, who can contacted by phone at 705-728-1968, Ext. XXXX or by email at <a>Cheryl.Boyes@GeorgianCollege.ca</a><br /><br />Please ' +
                          'get in touch with me as soon as possible. Unfortunately, if I don’t hear from you, and you miss the next two classes, you risk being withdrawn ' +
                          'from ' + courseInfo[0].courseName + '.<br /><br />Best Regards,<br /><br /><strong>Joanne Pineda, MA AdEd</strong><br /><strong>Academic Preparation Faculty' +
                          '</strong><br /><br />Georgian College| One Georgian Drive | Barrie ON | L4M 3X9' // html body
                        };
                        var query = "UPDATE Attendance SET twoMissedClassMsg = 'true' WHERE attendanceID IN ('" + course[i].attendanceID + "','" + course[i + 1].attendanceID + "')";
                        new sql.Request(connection)
                        .query(query)
                        .then(function(result) {
                          new MailService().sendMessage('Two Missed Classes', mailOptions);
                          new ActivityService().reportActivity('scheduledEmails', 'Two Missed Classes', 'success', student.userID, '', student.firstName + ' ' + student.lastName + ' has missed two consecutive classes for the following course: ' + courseInfo[0].courseName);
                        }).catch(function(err) {
                          console.log("Select userID and email from all users " + err);
                        });
                      }
                    }
                  }
                }
              }
              let mailOptionsAdmin = {
                from: 'academic.career.prep@gmail.com', // sender address
                to: 'academic.career.prep@gmail.com', // list of receivers
                subject: 'SCHEDULER ✔', // Subject line
                text: '', // plain text body
                html: '<b> Hi admin!</b><br  /><br  />There were <strong>' + twoMissedClasses + '</strong> emails sent out due to missed classes today. <br/> There were <strong>' +
                fourMissedClasses + '</strong> removals from a course today.' // html body
              };
              new MailService().sendMessage("Scheduled Message", mailOptionsAdmin);
              console.log("TOTAL WARNING EMAILS SENT: " + twoMissedClasses);
              console.log("TOTAL REMOVAL EMAILS SENT: " + fourMissedClasses);
            }).catch(function(err) {
              console.log("Select courseID and courseName from all courses " + err);
            });
          }).catch(function(err) {
            console.log("Select userID and email from all users " + err);
          });
        }).catch(function(err) {
          console.log("Select all students " + err);
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
