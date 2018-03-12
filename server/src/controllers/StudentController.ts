import express = require("express");
import jwt = require('jsonwebtoken');
import AuthController = require("../controllers/AuthController");
const PRFService = require("../services/PRFService");
var sql = require('mssql');
var auth = ["Admin", "Staff", "Instructor"];

var config = require('../config');
config = config.db;

class StudentController {

  create(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var student = req.body;
          sql.connect(config)
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
                + student.comments + "')")
                .then(function() {
                  res.send({ status: "success" });
                }).catch(function(err) {
                  res.send({ status: "error" });
                  console.log("(CREATE STUDENT) Error inserting new student " + err);
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log('(CREATE STUDENT) Connection Error ' + e);
      res.send({ "error": "error in your request" });
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
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query(query)
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  res.send({ "error": "error" });
                  console.log("(GET STUDENTS BY ID) Error selecting students " + err);
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log('(GET STUDENTS BY ID) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  update(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var student = req.body;
          var _id: string = req.params._id;
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query("UPDATE Students SET firstName='" + student.firstName + "', lastName='" + student.lastName + "', birthdate='" + student.birthday + "', phone='" + student.phone + "' WHERE userID = '" + _id + "'")
                .then(function(recordset) {
                  res.send({ "success": "success" });
                }).catch(function(err) {
                  res.send({ "error": "error" });
                  console.log("(UPDATE STUDENT) Error updating student " + err);
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log('(UPDATE STUDENT) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  delete(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var _id: string = req.params._id;
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query("DELETE FROM Students WHERE userID = '" + _id + "'")
                .then(function() {
                  new sql.Request(connection)
                    .query("DELETE FROM Users WHERE userID = '" + _id + "'")
                    .then(function() {
                      res.send({ "success": "success" });
                    }).catch(function(err) {
                      res.send({ "error": "error" });
                      console.log("(DELETE USER) Error deleting user with id " + _id + ". " + err);
                    });
                }).catch(function(err) {
                  res.send({ "error": "error" });
                  console.log("(DELETE USER) Error deleting student with id " + _id + ". " + err);
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log('(DELETE STUDENT) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  retrieve(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff", "Instructor"], done: function() {
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query('SELECT Students.*, Users.email, Users.active FROM Students LEFT JOIN Users ON Students.userID = Users.UserID')
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  res.send({ "error": "error" });
                  console.log("(RETRIEVE STUDENTS) Error getting all students " + err);
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log('(RETRIEVE STUDENTS) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  findById(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var _id: string = req.params._id;
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query("SELECT *  FROM Students WHERE studentID = '" + _id + "'")
                .then(function(recordset) {
                  res.send(recordset[0]);
                }).catch(function(err) {
                  res.send({ "error": "error" });
                  console.log("(FIND STUDENT BY ID) Error getting student by id " + err);
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log('(FIND STUDENT BY ID) Connection Error ' + e);
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
      sql.connect(config)
        .then(function(connection) {
          new sql.Request(connection)
            .query("INSERT INTO Timetables (userID,startDate,endDate,courseID,instructorID) VALUES ('" + _userID + "','" + _startDate + "','" + _endDate + "','" + _courseID + "','" + _instructorID + "')")
            .then(function() {
              res.send({ "success": "success" });
            }).catch(function(err) {
              res.send({ "error": "error" });
              console.log("insert into timetable " + err);
            });
        }).catch(function(err) {
          console.log(err);
          res.send({ "error": "error" });
        });
    }
    catch (e) {
      console.log('(ADD TO TIMETABLE) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  removeFromTimetable(req: express.Request, res: express.Response): void {
    try {
      var _userID = req.params._userID;
      var _courseID = req.params._courseID;
      sql.connect(config)
        .then(function(connection) {
          new sql.Request(connection)
            .query("DELETE FROM Timetables WHERE userID = ('" + _userID + "') AND courseID = ('" + _courseID + "')")
            .then(function() {
              res.send({ "success": "success" });
            }).catch(function(err) {
              res.send({ "error": "error" });
              console.log("(REMOVE FROM TIMETABLES) Error removing from timetables " + err);
            });
        }).catch(function(err) {
          console.log(err);
          res.send({ "error": "error" });
        });
    }
    catch (e) {
      console.log('(REMOVE FROM TIMETABLES) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  getTimetables(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Instructor", "Admin", "Staff"], done: function() {
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query("SELECT * FROM Timetables")
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  res.send({ "error": "error" });
                  console.log("(GET TIMETABLES) Error getting student timetables " + err);
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log('(GET TIMETABLES) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  getTimetablesByCourseId(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Instructor"], done: function() {
          var _id: string = req.params._courseID;
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query("SELECT * FROM Timetables WHERE courseID = '" + _id + "'")
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  res.send({ "error": "error" });
                  console.log("(GET TIMETABLES BY COURSE ID ) Get timetables by courseID " + err);
                });

            }).catch(function(err) {
              console.log(err);
              res.send({ status: "error" });
            });
        }
      });
    }
    catch (e) {
      console.log('(GET TIMETABLES BY COURSE ID) Connection Error ' + e);
      res.send({ status: "error in your request" });
    }
  }

  getTimetablesByUserId(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Student", "Admin", "Staff"], done: function() {
          var _id: string = req.params.userID;
          console.log(_id);
          sql.connect(config).then(function(connection) {
            new sql.Request(connection)
              .query(`select * FROM Timetables WHERE userID = ${_id}`)
              .then((result) => {
                console.log('GETTING TIMETABLE: ' + result);
                if (result.length > 0) {
                  let query = 'select * from course where';
                  for (let i = 0; i < result.length; i++) {
                    if (i === 0) {
                      query += ' courseId = ' + result[i].courseID;
                    } else {
                      query += " OR courseId = " + result[i].courseID;
                    }
                  }
                  new sql.Request(connection).query(query).then((result) => {
                    res.send(result);
                  }).catch(err => {
                    //     // ... error checks
                    res.send({ "status": "error" });
                    console.log("(GET TIMETABLE BY USER ID) There was an error selecting courses " + err)
                  });
                } else {
                  res.send({"status":'No Timetable Info'});
                }
              }).catch(err => {
                //     // ... error checks
                res.send({ "status": "error" });
                console.log("(GET TIMETABLE BY USER ID) There was an error selecting timetables " + err)
              });
          })
        }
      });
    }
    catch (e) {
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

          sql.connect(config)
            .then(function(connection) {
              console.log(dateTime);
              new sql.Request(connection)
                .query("INSERT INTO CaseNotes VALUES ('" + _id + "', '" + caseNote + "', '" + dateTime + "')")
                .then(function() {
                  res.send({ "success": "success" });
                }).catch(function(err) {
                  res.send({ "error": "error" });
                  console.log("(CREATE NOTE) Error inserting new note " + err);
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log('(CREATE NOTE) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  getNote(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff", "Instructor"], done: function() {
          var _id: string = req.params._studentID;
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query("SELECT *  FROM CaseNotes WHERE studentID = '" + _id + "' ORDER BY dateTime DESC")
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  res.send({ "error": "error" });
                  console.log("Get case note by id " + err);
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log('(GET NOTE) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  deleteNote(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var _id: string = req.params._id;
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query("DELETE FROM caseNotes WHERE caseNoteID = '" + _id + "'")
                .then(function() {
                  res.send({ "success": "success" });
                }).catch(function(err) {
                  res.send({ "error": "error" });
                  console.log("note removed " + err);
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log('(DELETE NOTE) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  insertAttendance(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff", "Instructor"], done: function() {
          var attendance = req.body;
          var query = "INSERT INTO Attendance (courseID, date, userID, attendanceValue) VALUES ";
          var count = 0;
          if (attendance.students.length > 0) {
            var date = attendance.date;
            for (let student of attendance.students) {
              if (count === 0) {
                query += "('" + attendance.courseID + "', '" + date + "', '" + student.userID + "', '" + student.attendanceValue + "' )";
              } else {
                query += ", ('" + attendance.courseID + "', '" + date + "', '" + student.userID + "', '" + student.attendanceValue + "' )";
              }
              count++;
            }
            console.log(query);
            sql.connect(config)
              .then(function(connection) {
                new sql.Request(connection)
                  .query(query)
                  .then(function(recordset) {
                    // set schedule check on DB
                    console.log("attendance record inserted");
                    res.send(recordset);
                  }).catch(function(err) {
                    res.send({ "error": "error" });
                    console.log("Attendance " + err);
                  });
              }).catch(function(err) {
                console.log(err);
                res.send({ "error": "error" });
              });
          } else {
            console.log("No absent students");
            res.send({ status: "No absent students" });
          }
        }
      });
    }
    catch (e) {
      console.log('(INSERT ATTENDANCE) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  getAllAttendance(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff", "Instructor"], done: function() {
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query("SELECT * FROM Attendance")
                .then(function(recordset) {
                  for (let item of recordset) {
                    item.date = item.date.split(' ');
                  }
                  res.send(recordset);
                }).catch(function(err) {
                  res.send({ "error": "error" });
                  console.log("Get all attendance " + err);
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log('(GET ALL ATTENDANCE) Connection Error ' + e);
      res.send({ "error": "error in your request" });
    }
  }

  populatePRF(req: express.Request, res: express.Response): void {
    console.log("Populating PRF...");
    new AuthController().authUser(req, res, {
      requiredAuth: auth, done: function() {
        var _id: string = req.params._id;
        sql.connect(config)
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
          }).catch(function(e) {
            console.log(e);
            res.send({ "error": "error" });
          });
      }
    });
  }
}
export = StudentController;
