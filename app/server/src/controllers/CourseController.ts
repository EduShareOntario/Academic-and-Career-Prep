import express = require("express");
import jwt = require('jsonwebtoken');
import bcrypt = require('bcrypt');
import AuthController = require("../controllers/AuthController");
const ActivityService = require("../services/ActivityService");
const sql = require('mssql');
var auth = ["Admin", "Staff", "Instructor"];
const config = require('../config');
const db = config.db;
const mail = config.mail;
const site_settings = config.site_settings;

class CourseController {

  // select
  retrieve(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function(currentUserID) {

          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query(`SELECT course.*,concat(concat(staff.firstName,' '),staff.lastName)[professorName],campusName FROM Course
          left join users on users.userID=course.professorId
          left join campus on campus.campusId = course.campusId
          left join staff on staff.userID = course.professorId`)
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  console.log("Retrieve all course " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error retrieving all courses.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Retrieve all courses: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });

        }
      });
    } catch (err) {
      console.log("Error - Retrieve all courses: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error retrieving all courses.", serverMsg: err });
    }
  }

  getInstructorCourses(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function(currentUserID) {

          var _id: string = req.params._id;

          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query(`SELECT * FROM Course WHERE professorId = ${_id}`)
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  console.log("Select instructors courses " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error retrieving all instructor courses.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Get instructors courses: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });

        }
      });
    } catch (err) {
      console.log("Error - Get instructors courses: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error retrieving all instructor courses.", serverMsg: err });
    }
  }

  delete(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function(currentUserID) {

          var _id: string = req.params._id;

          sql.connect(db)
            .then(function(connection) {
              sql.query
                `DELETE FROM Course WHERE courseID = ${_id}`
                .then(function(result) {
                  new ActivityService().reportActivity('course', 'Course Deleted', 'success', _id, currentUserID, 'Course has been deleted.');
                  res.send({ result: "success", title: "Course Deleted", msg: "Course has been deleted successfully.", serverMsg: "" });
                }).catch(function(err) {
                  console.log("Update course " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error deleting the course.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Delete course: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });

        }
      });
    } catch (err) {
      console.log("Error - Delete course: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error deleting the course.", serverMsg: err });
    }
  }

  update(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function(currentUserID) {

          var course = req.body;
          var _id: string = req.params._id;

          sql.connect(db)
            .then(function(connection) {
              sql.query
                `UPDATE Course SET courseName = ${course.courseName},courseType = ${course.courseType},professorId = ${course.professorId},
          campusId = ${course.campusId},classroom = ${course.classroom},courseStart = ${course.courseStart},
          courseEnd = ${course.courseEnd},classTimeStr = ${course.classTimeStr} WHERE courseID = ${_id}`
                .then(function(result) {
                  new ActivityService().reportActivity('course', 'Course Updated', 'success', _id, currentUserID, 'Course has been updated.');
                  res.send({ result: "success", title: "Course Updated!", msg: "Course has been updated successfully.", serverMsg: "" });
                }).catch(function(err) {
                  console.log("Update course " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error updating the course.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Update course: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });

        }
      });
    } catch (err) {
      console.log("Error - Update course: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error updating the course.", serverMsg: err });
    }
  }

  findById(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function(currentUserID) {

          var _id: string = req.params._id;

          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
              .query(`SELECT course.*,username[professorName],campusName FROM Course
          left join users on users.userID=course.professorId
          left join campus on campus.campusId = course.campusId
          where courseId=${_id}`)
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  console.log("Error - Find course by id: " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error finding course by id.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Find course by id: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });

        }
      });
    } catch (err) {
      console.log("Error - Find course by id: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error finding course by id.", serverMsg: err });
    }
  }

  // insert
  create(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function(currentUserID) {

          // get course from req url
          var course = req.body;

          sql.connect(db)
            .then(function() {
              sql.query
                `INSERT INTO Course (courseName, professorId, campusId, classroom, classTimeStr,courseStart,courseEnd)
        VALUES(${course.courseName}, ${course.courseType}, ${course.professorId}, ${course.campusId}, ${course.classroom}, ${course.classTimeStr},
          ${course.courseStart},${course.courseEnd})`
                .then(function(result) {
                  new ActivityService().reportActivity('course', 'Course Created', 'success', '', currentUserID, "Course name '" + course.courseName + "' has been successfully created." );
                  res.send({ result: "success", title: "Course Created!", msg: "Course has been created successfully.", serverMsg: "" });
                }).catch(function(err) {
                  console.log("Error - Create course: " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error creating course.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Create course: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });

        }
      });
    } catch (err) {
      console.log("Error - Create course: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error creating course.", serverMsg: err });
    }
  }

  getCourseTypes(req: express.Request, res: express.Response): void {
    try {

      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function(currentUserID) {

          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query(`SELECT * FROM CourseTypes`)
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  console.log("Error - Get course types: " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error retrieving course types.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Get campuses: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });

        }
      });
    } catch (err) {
      console.log("Error - Get Course Types: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error retrieving course types.", serverMsg: err });
    }
  }

  getCampuses(req: express.Request, res: express.Response): void {
    try {

      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function(currentUserID) {

          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query(`SELECT * FROM Campus`)
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  console.log("Error - Get campuses: " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error retrieving campus list.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Get campuses: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });

        }
      });
    } catch (err) {
      console.log("Error - Get Campuses: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error retrieving campus list.", serverMsg: err });
    }
  }

  getInstructors(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function(currentUserID) {

          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query(`SELECT users.*,concat(concat(staff.firstName,' '),staff.lastName)[professorName] FROM users
          left join  staff on staff.userID = users.userID
          where userType LIKE '%instructor%'`)
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  console.log("Error - Get Instructors: " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error retrieving all instructors.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Get instructors: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });

        }
      });
    } catch (err) {
      console.log("Error - Get Instructors: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error retrieving all instructors.", serverMsg: err });
    }
  }

  getWaitList(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function(currentUserID) {

          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query(`SELECT * FROM WaitList`)
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  console.log("Error - Get wait list: " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error retrieving wait list information.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Get instructors: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });

        }
      });
    } catch (err) {
      console.log("Error - Get wait list: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error retrieving wait list information.", serverMsg: err });
    }
  }

  getWaitListById(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function(currentUserID) {

          var _id: string = req.params._id;

          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query(`SELECT * FROM WaitList WHERE userID = ${_id}`)
                .then(function(result) {
                  res.send(result);
                }).catch(function(err) {
                  console.log("Error - Get wait list: " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error retrieving wait list information.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Get instructors: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });

        }
      });
    } catch (err) {
      console.log("Error - Get wait list: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error retrieving wait list information.", serverMsg: err });
    }
  }

  addToWaitList(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function(currentUserID) {

          // get course from req url
          var course = req.body;
          var userID = course.userID;
          var courseType = course.courseType;
          var date = course.date;
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("INSERT INTO WaitList (courseType, userID, date) VALUES ('" + courseType + "', '" + userID + "', '" + date + "')")
                .then(function(result) {
                  new ActivityService().reportActivity('client', 'Course Wait List', 'success', userID, currentUserID, 'User has been added to the course wait list.');
                  res.send({ result: "success", title: "Success!", msg: "User has been added to the wait list.", serverMsg: "" });
                }).catch(function(err) {
                  console.log("Error - Add to wait list: " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error while adding student to the wait list.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Create course: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });

        }
      });
    } catch (err) {
      console.log("Error - Add to wait list: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error while adding student to the wait list.", serverMsg: err });
    }
  }

  removeFromWaitList(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function(currentUserID) {

          var _studentId: string = req.params._studentId;
          var _courseType: string = req.params._courseType;

          sql.connect(db)
            .then(function(connection) {
              sql.query
                `DELETE FROM WaitList WHERE userID = ${_studentId} AND courseType = ${_courseType}`
                .then(function(result) {
                  new ActivityService().reportActivity('wait list', 'Course Wait List', 'success', _studentId, currentUserID, 'Student has been removed from the ' + _courseType + ' wait list.');
                  res.send({ result: "success", title: "Student Removed", msg: "Student successfully removed from wait list.", serverMsg: "" });
                }).catch(function(err) {
                  console.log("Remove from wait list " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error removing student from wait list.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Delete course: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });

        }
      });
    } catch (err) {
      console.log("Error - Remove from wait list: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error removing student from wait list.", serverMsg: err });
    }
  }

  addToCourseTypes(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function(currentUserID) {

          // get course from req url
          console.log(req.body);
          var courseType = req.body.courseType;
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("INSERT INTO CourseTypes (courseType) VALUES ('" + courseType + "')")
                .then(function(result) {
                  new ActivityService().reportActivity('course', 'Manage Courses', 'success', '', currentUserID, "New course type named: " + courseType + " has been added. ");
                  res.send({ result: "success", title: "Success!", msg: "New course type has been added.", serverMsg: "" });
                }).catch(function(err) {
                  console.log("Error - Add new course type: " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error while adding the new course type.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Add new course type: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });

        }
      });
    } catch (err) {
      console.log("Error - Add new course type: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error while adding the new course type.", serverMsg: err });
    }
  }

}

export = CourseController;
