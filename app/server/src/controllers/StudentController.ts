import express = require("express");
import jwt = require('jsonwebtoken');
import AuthController = require("../controllers/AuthController");
const PRFService = require("../services/PRFService");
const MailService = require("../services/MailService");
var sql = require('mssql');
var auth = ["Admin", "Staff", "Instructor"];
const config = require('../config');
const db = config.db;
const mail = config.mail;
const site_settings = config.site_settings;

class StudentController {

  create(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var student = req.body;
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("INSERT INTO Students VALUES ('" + student.userID + "','"
                + student.studentNumber + "','"
                + student.firstName + "', '"
                + student.lastName + "','"
                + student.inquiryDate + "','"
                + student.birthdate + "','"
                + student.phone + "','"
                + student.allowDetailedMessage + "','"
                + student.okayToText + "','"
                + student.alternateNumber + "','"
                + student.allowDetailedMessageAlternate + "','"
                + student.okayToTextAlternate + "','"
                + student.editConsentRequest + "','"
                + student.editConsentPermission + "','"
                + student.comments + "')")
                .then(function() {
                  res.send({ result: "success", title: "New User Created!", msg: "Student user has been successfully created!", serverMsg: "" });
                }).catch(function(err) {
                  console.log("Error - Create new student: " + err);
                  res.send({ result: "error", title: "Connection Error", msg: "There was an error creating client as student.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (err) {
      console.log("Error - Create student: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error creating client as student.", serverMsg: err });
    }
  }

  updateGeneralInfo(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var student = req.body;
          var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          var emailValidation = re.test(student.email);
          if (!emailValidation) {
            res.send({ result: "invalid", title: "Invalid Input", msg: "Incorrect email format.", serverMsg: "" });
          } else {
            sql.connect(db)
              .then(function(connection) {
                new sql.Request(connection)
                  .query("SELECT userID, username, email FROM Users")
                  .then(function(users) {
                    var validated = true;
                    var error;
                    var currentUsername = users.filter(x => x.userID === student.userID);
                    currentUsername = currentUsername[0].username;
                    users = users.filter(x => x.userID !== student.userID);
                    student.username = student.firstName + student.lastName;
                    student.username = student.username.toLowerCase();
                    student.username = student.username.replace(/\s+/g, '');
                    for (let record of users) {
                      if (record.username === student.username) {
                        validated = false;
                        error = "Username is already in use.";
                        break;
                      } else if (record.email === student.email && record.email !== "BA.ACP@georgiancollege.ca" && record.email !== "OR.ACP@georgiancollege.ca" && record.email !== "OS.ACP@georgiancollege.ca") {
                        validated = false;
                        error = "Email is already in use.";
                        break;
                      }
                    }
                    if (!validated) {
                      res.send({ result: "invalid", title: "Invalid Input", msg: error, serverMsg: "" });
                    } else {
                      var studentsQuery = "UPDATE Students SET studentNumber='" + student.studentNumber
                        + "', firstName='" + student.firstName
                        + "', lastName='" + student.lastName
                        + "' WHERE studentID = '" + student.studentID + "'"
                      new sql.Request(connection)
                        .query(studentsQuery)
                        .then(function(studentsResult) {
                          var usersQuery = "UPDATE Users SET email='" + student.email
                          + "', username='" + student.username
                          + "' WHERE userID = '" + student.userID + "'"
                          new sql.Request(connection)
                            .query(usersQuery)
                            .then(function(usersResult) {
                              if(currentUsername != student.username) {
                                let mailOptions = {
                                  from: mail.user, // sender address
                                  to: student.email, // recipient address
                                  subject: 'Username Update!', // Subject line
                                  text: '', // plain text body
                                  html: 'Your username has been changed to <b>' + student.username + '</b>.<br /><br /> Login at ' + site_settings.url + '  <br /><br /> Thankyou'// html body
                                };
                                new MailService().sendMessage("Student Username Update", mailOptions);
                              }
                              res.send({ result: "success", title: "Update Success!", msg: "Student user updated!", serverMsg: "" });
                            }).catch(function(err) {
                              console.log("Error - Update user: " + err);
                              res.send({ result: "error", title: "Error", msg: "There was an error updating user information.", serverMsg: err });
                            });
                        }).catch(function(err) {
                          console.log("Error - Update student: " + err);
                          res.send({ result: "error", title: "Error", msg: "There was an error updating student information.", serverMsg: err });
                        });
                    }
                  }).catch(function(err) {
                    console.log("Error - Select userID, usearname and email from users: " + err);
                    res.send({ result: "error", title: "Error", msg: "There was an error retrieving userID, usearname and email from the users table.", serverMsg: err });
                  });
              }).catch(function(err) {
                console.log("DB Connection error: " + err);
                res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
              });
          }
        }
      });
    } catch (err) {
      console.log("Error - Update student info: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error updating this students information.", serverMsg: err });
    }
  }

  getStudentsById(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff", "Instructor"], done: function() {
          var timetables = req.body;
          var query = "SELECT * FROM Students WHERE userID =";
          var count = 0;
          for (let timetable of timetables) {
            if (count === 0) {
              query += " " + timetable.userID;
            } else {
              query += " OR userID = " + timetable.userID;
            }
            count++;
          }
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query(query)
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  console.log("(GET STUDENTS BY ID) Error selecting students " + err);
                  res.send({ status: "error" });
                });
            }).catch(function(err) {
              console.log("DB Connection error: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (err) {
      console.log("Error - Get students by ID: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error getting students by ID.", serverMsg: err });
    }
  }

  delete(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var _id: string = req.params._id;
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("DELETE FROM Students WHERE userID = '" + _id + "'")
                .then(function() {
                  new sql.Request(connection)
                    .query("DELETE FROM Users WHERE userID = '" + _id + "'")
                    .then(function() {
                      res.send({ "success": "success" });
                    }).catch(function(err) {
                      console.log("(DELETE USER) Error deleting user with id " + _id + ". " + err);
                      res.send({ "error": "error" });
                    });
                }).catch(function(err) {
                  console.log("(DELETE USER) Error deleting student with id " + _id + ". " + err);
                  res.send({ "error": "error" });
                });
            }).catch(function(err) {
              console.log("DB Connection error: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (e) {
      console.log('(DELETE STUDENT) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  retrieve(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff", "Instructor"], done: function() {
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query('SELECT Students.*, Users.email, Users.active FROM Students LEFT JOIN Users ON Students.userID = Users.UserID')
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  console.log("(RETRIEVE STUDENTS) Error getting all students " + err);
                  res.send({ "error": "error" });
                });
            }).catch(function(err) {
              console.log("DB Connection error: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (e) {
      console.log('(RETRIEVE STUDENTS) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  findById(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff", "Instructor", "Student"], done: function() {
          var _id: string = req.params._id;
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("SELECT * FROM Students WHERE userID = '" + _id + "'")
                .then(function(recordset) {
                  res.send(recordset[0]);
                }).catch(function(err) {
                  console.log("(FIND STUDENT BY ID) Error getting student by id " + err);
                  res.send({ "error": "error" });
                });
            }).catch(function(err) {
              console.log("DB Connection error: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (e) {
      console.log('(FIND STUDENT BY ID) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  editConsentRequest(req: express.Request, res: express.Response) {
    var _id: string = req.params._id;
    sql.connect(db)
      .then(function(connection) {
        new sql.Request(connection)
          .query('SELECT firstName, lastName FROM Students WHERE userID = ' + _id + '')
          .then(function(student) {
            new sql.Request(connection)
              .query("UPDATE Students SET editConsentRequest = 'true' WHERE userID = " + _id + "")
              .then(function(result) {
                student = student[0];
                var mailOptions = {
                  from: mail.user, // sender address
                  to: mail.user, // reciever TBD
                  subject: student.firstName + ' ' + student.lastName + ' Request to Edit Consent (Student)', // Subject line
                  text: '', // plain text body
                  html: 'Student ' + student.firstName + ' ' + student.lastName + ' wants to edit their consent form.<br/> Please login to the students page at: ' + site_settings.url + '/#/students. Search for ' + student.firstName + ' ' + student.lastName + ' in the students table, select View Info from the dropdown then select Consent to grant or deny access.'// html body
                };
                new MailService().sendMessage("Request to Edit Consent", mailOptions);
                res.send({ status: "success" });
              }).catch(function(err) {
                console.log("editConsentRequest: Update request to edit" + err);
                res.send({ status: "error" });
              });
          }).catch(function(err) {
            console.log("editConsentRequest: Select first and last name" + err);
            res.send({ status: "error" });
          });
      }).catch(function(err) {
        console.log("DB Connection error: " + err);
        res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
      });
  }

  grantConsentEditPermission(req: express.Request, res: express.Response) {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var permission = req.body.permission;
          var student = req.body.student;
          console.log("yaya");
          console.log("Value: " + permission + ', ' + "UserID: " + student.userID);
          if (permission) {
            sql.connect(db)
              .then(function(connection) {
                new sql.Request(connection)
                  .query("UPDATE Students SET editConsentRequest = 'false' WHERE userID = " + student.userID)
                  .then(function(result1) {
                    new sql.Request(connection)
                      .query("UPDATE Students SET editConsentPermission = 'true' WHERE userID = " + student.userID)
                      .then(function(result2) {
                        new sql.Request(connection)
                          .query("SELECT email FROM users WHERE userID = " + student.userID)
                          .then(function(studentEmail) {
                            var mailOptions = {
                              from: mail.user, // sender address
                              to: studentEmail[0].email, // student.email
                              subject: 'Request Granted!', // Subject line
                              text: '', // plain text body
                              html: 'You can now login at: https://gcacademicprep.azurewebsites.net and make changes to your consent form.'// html body
                            };
                            new MailService().sendMessage("Consent Edit Request Granted", mailOptions);
                            res.send({ status: "granted" });
                          }).catch(function(err) {
                            console.log("grantConsentEditPermission: Get email for user. " + err);
                            res.send({ "error": "error" });
                          });
                      }).catch(function(err) {
                        console.log("grantConsentEditPermission: Set consent equal to true(needs to be completed). " + err);
                        res.send({ "error": "error" });
                      });
                  }).catch(function(err) {
                    console.log("grantConsentEditPermission: Set editConsentRequest equal to false. " + err);
                    res.send({ "error": "error" });
                  });
              }).catch(function(err) {
                console.log("DB Connection error: " + err);
                res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
              });
          } else {
            res.send({ status: "denied" });
          }
        }
      });
    } catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
    }
  }

  addToTimetable(req: express.Request, res: express.Response): void {
    try {
      var info = req.body[0];
      var _userID = info.userID;
      var _startDate = info.startDate;
      var _endDate = info.endDate;
      var _courseID = info.courseID;
      var _instructorID = info.instructorID;
      sql.connect(db)
        .then(function(connection) {
          new sql.Request(connection)
            .query("INSERT INTO Timetables (userID,startDate,endDate,courseID,instructorID) VALUES ('" + _userID + "','" + _startDate + "','" + _endDate + "','" + _courseID + "','" + _instructorID + "')")
            .then(function() {
              res.send({ "success": "success" });
            }).catch(function(err) {
              console.log("insert into timetable " + err);
              res.send({ "error": "error" });
            });
        }).catch(function(err) {
          console.log("DB Connection error: " + err);
          res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
        });
    } catch (e) {
      console.log('(ADD TO TIMETABLE) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  removeFromTimetable(req: express.Request, res: express.Response): void {
    try {
      var _userID = req.params._userID;
      var _courseID = req.params._courseID;
      sql.connect(db)
        .then(function(connection) {
          new sql.Request(connection)
            .query("DELETE FROM Timetables WHERE userID = ('" + _userID + "') AND courseID = ('" + _courseID + "')")
            .then(function() {
              res.send({ "success": "success" });
            }).catch(function(err) {
              console.log("(REMOVE FROM TIMETABLES) Error removing from timetables " + err);
              res.send({ "error": "error" });
            });
        }).catch(function(err) {
          console.log("DB Connection error: " + err);
          res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
        });
    } catch (e) {
      console.log('(REMOVE FROM TIMETABLES) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  getTimetables(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Instructor", "Admin", "Staff"], done: function() {
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("SELECT * FROM Timetables")
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  console.log("(GET TIMETABLES) Error getting student timetables " + err);
                  res.send({ "error": "error" });
                });
            }).catch(function(err) {
              console.log("DB Connection error: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (e) {
      console.log('(GET TIMETABLES) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  getTimetablesByCourseId(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var _id: string = req.params._courseID;
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("SELECT * FROM Timetables WHERE courseID = '" + _id + "'")
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  console.log("(GET TIMETABLES BY COURSE ID ) Get timetables by courseID " + err);
                  res.send({ "error": "error" });
                });
            }).catch(function(err) {
              console.log("DB Connection error: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (e) {
      console.log('(GET TIMETABLES BY COURSE ID) Connection Error ' + e);
      res.send({ status: "error in your request" });
    }
  }

  getTimetablesByUserId(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Student", "Admin", "Staff", "Instructor"], done: function() {
          var _id: string = req.params.userID;
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query(`select * FROM Timetables WHERE userID = ${_id}`)
                .then((result) => {
                  if (result.length > 0) {
                    let query = 'select * from course where';
                    for (let i = 0; i < result.length; i++) {
                      if (i === 0) {
                        query += ' courseId = ' + result[i].courseID;
                      } else {
                        query += " OR courseId = " + result[i].courseID;
                      }
                    }
                    new sql.Request(connection)
                      .query(query)
                      .then((result) => {
                        res.send(result);
                      }).catch(function(err) {
                        console.log("(GET TIMETABLE BY USER ID) There was an error selecting courses " + err);
                        res.send({ "status": "error" });
                      });
                  } else {
                    res.send({ "status": 'No Timetable Info' });
                  }
                }).catch(function(err) {
                  console.log("(GET TIMETABLE BY USER ID) There was an error selecting timetables " + err);
                  res.send({ "status": "error" });
                });
            }).catch(function(err) {
              console.log("DB Connection error: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (e) {
      console.log('(GET TIMETABLES BY USER ID) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  createNote(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff", "Instructor"], done: function() {
          var caseNote = req.body.caseNote;
          var dateTime = req.body.dateTime;
          var _id: string = req.params._studentID;

          sql.connect(db)
            .then(function(connection) {
              console.log(dateTime);
              new sql.Request(connection)
                .query("INSERT INTO CaseNotes VALUES ('" + _id + "', '" + caseNote + "', '" + dateTime + "')")
                .then(function() {
                  res.send({ "success": "success" });
                }).catch(function(err) {
                  console.log("(CREATE NOTE) Error inserting new note " + err);
                  res.send({ "error": "error" });
                });
            }).catch(function(err) {
              console.log("DB Connection error: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (e) {
      console.log('(CREATE NOTE) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  getNote(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff", "Instructor"], done: function() {
          var _id: string = req.params._studentID;
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("SELECT *  FROM CaseNotes WHERE studentID = '" + _id + "' ORDER BY dateTime DESC")
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  console.log("Get case note by id " + err);
                  res.send({ "error": "error" });
                });
            }).catch(function(err) {
              console.log("DB Connection error: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (e) {
      console.log('(GET NOTE) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  deleteNote(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var _id: string = req.params._id;
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("DELETE FROM caseNotes WHERE caseNoteID = '" + _id + "'")
                .then(function() {
                  res.send({ "success": "success" });
                }).catch(function(err) {
                  console.log("note removed " + err);
                  res.send({ "error": "error" });
                });
            }).catch(function(err) {
              console.log("DB Connection error: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (e) {
      console.log('(DELETE NOTE) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  insertAttendance(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff", "Instructor"], done: function() {
          var attendance = req.body;
          var query = "INSERT INTO Attendance (courseID, date, userID, attendanceValue, twoMissedClassMsg, fourMissedClassMsg) VALUES ";
          var count = 0;
          if (attendance.students.length > 0) {
            var date = attendance.date;
            for (let student of attendance.students) {
              if (count === 0) {
                query += "('" + attendance.courseID + "', '" + date + "', '" + student.userID + "', '" + student.attendanceValue + "', 'False', 'False' )";
              } else {
                query += ", ('" + attendance.courseID + "', '" + date + "', '" + student.userID + "', '" + student.attendanceValue + "', 'False', 'False' )";
              }
              count++;
            }
            sql.connect(db)
              .then(function(connection) {
                new sql.Request(connection)
                  .query(query)
                  .then(function(recordset) {
                    // set schedule check on DB
                    console.log("attendance record inserted");
                    res.send(recordset);
                  }).catch(function(err) {
                    console.log("Attendance " + err);
                    res.send({ "error": "error" });
                  });
              }).catch(function(err) {
                console.log("DB Connection error: " + err);
                res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
              });
          } else {
            console.log("No absent students");
            res.send({ status: "No absent students" });
          }
        }
      });
    } catch (e) {
      console.log('(INSERT ATTENDANCE) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  getAllAttendance(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff", "Instructor"], done: function() {
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("SELECT * FROM Attendance")
                .then(function(recordset) {
                  for (let item of recordset) {
                    item.date = item.date.split(' ');
                  }
                  res.send(recordset);
                }).catch(function(err) {
                  console.log("Get all attendance " + err);
                  res.send({ "error": "error" });
                });
            }).catch(function(err) {
              console.log("DB Connection error: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (e) {
      console.log('(GET ALL ATTENDANCE) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  populatePRF(req: express.Request, res: express.Response): void {
    console.log("Populating PRF...");
    new AuthController().authUser(req, res, {
      requiredAuth: auth, done: function() {
        var _id: string = req.params._id;
        sql.connect(db)
          .then(function(connection) {
            new sql.Request(connection)
              .query("SELECT * FROM Clients C INNER JOIN SuitabilityForm S ON C.userID = S.userID WHERE C.userID = '" + _id + "' AND S.userID = '" + _id + "'")
              .then(function(recordset) {
                new PRFService().populatePRF(recordset[0]);
                res.send({ "success": "success" });
              }).catch(function(err) {
                console.log("Get client by id for prf " + err);
                res.send({ "error": "error" });
              });
          }).catch(function(err) {
            console.log("DB Connection error: " + err);
            res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
          });
      }
    });
  }
}
export = StudentController;
