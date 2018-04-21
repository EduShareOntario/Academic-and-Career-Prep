import express = require("express");
import jwt = require('jsonwebtoken');
import bcrypt = require('bcrypt');
import AuthController = require("../controllers/AuthController");
const MailService = require("../services/MailService");
var sql = require('mssql');
var auth = ["Admin"];
const config = require('../config');
const db = config.db;
const mail = config.mail;
const site_settings = config.site_settings;

/*
    The staff controller communicates with the client
    side in order to manage all staff CRUD operations.
*/
class StaffController {

  /* Create new staff record */
  create(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var randomstring = Math.random().toString(36).slice(-8);
          randomstring = randomstring.charAt(0).toUpperCase() + randomstring.slice(1);
          var salt = bcrypt.genSaltSync(10);
          // Hash the password with the salt
          var password = bcrypt.hashSync(randomstring, salt);
          req.body.password = password;
          req.body.username = req.body.firstName + req.body.lastName;
          req.body.username = req.body.username.toLowerCase();
          req.body.username = req.body.username.replace(/\s+/g, '');
          var staff = req.body;
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("SELECT * FROM Users")
                .then(function(users) {
                  var validated = true;
                  var error;
                  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                  var emailValidation = re.test(staff.email);
                  for (let user of users) {
                    if (user.username === staff.username) {
                      validated = false;
                      error = "Username is already in use.";
                      break;
                    } else if (user.email === staff.email) {
                      validated = false;
                      error = "Email is already in use.";
                      break;
                    }
                  }
                  if (!emailValidation) {
                    res.send({ result: "invalid", title: "Invalid Input", msg: "Incorrect email format.", serverMsg: "" });
                  } else if (!validated) {
                    res.send({ result: "invalid", title: "Invalid Input", msg: error, serverMsg: "" });
                  } else {
                    new sql.Request(connection)
                      .query("INSERT INTO Users VALUES ('" + staff.username + "','" + staff.email + "','" + staff.password + "','" + staff.userType + "','false','" + staff.notify + "')")
                      .then(function() {
                        new sql.Request(connection)
                          .query("SELECT userID FROM Users WHERE username = '" + staff.username + "' AND password = '" + staff.password + "'")
                          .then(function(id) {
                            new sql.Request(connection)
                              .query("INSERT INTO Staff VALUES ('" + id[0].userID + "','" + staff.firstName + "', '" + staff.lastName + "')")
                              .then(function() {
                                // setup email data with unicode symbols
                                if (staff.notify) {
                                  let mailOptions = {
                                    from: mail.user, // sender address
                                    to: staff.email, // recipient address
                                    subject: 'Welcome!', // Subject line
                                    text: '', // plain text body
                                    html: 'Your username is <b>' + staff.username + '</b> and here is your new temporary password: <b>' + randomstring + '</b><br /> Please login at ' + site_settings.url + '  <br /><br /> Thankyou'// html body
                                  };
                                  new MailService().sendMessage("Welcome Staff", mailOptions);
                                }
                                res.send({ result: "success", title: "New User Created!", msg: "Staff user has been successfully created!", serverMsg: "" });
                              }).catch(function(err) {
                                console.log("insert staff " + err);
                                res.send({ result: "error", title: "Error", msg: "There was an error inserting a new staff record.", serverMsg: err });
                              });
                          }).catch(function(err) {
                            console.log("get user " + err);
                            res.send({ result: "error", title: "Error", msg: "There was an error getting the userID.", serverMsg: err });
                          });
                      }).catch(function(err) {
                        console.log("insert user " + err);
                        res.send({ result: "error", title: "Error", msg: "There was an error inserting a new user record.", serverMsg: err });
                      });
                  }
                }).catch(function(err) {
                  console.log("select all users " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error selecting all users.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (err) {
      console.log("Create new staff record: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error creating a new staff user.", serverMsg: err });
    }
  }

  /* Update staff record by ID */
  update(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var user = req.body;
          var _id: string = req.params._id;
          var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          var emailValidation = re.test(user.email);
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
                    var currentUsername = users.filter(x => x.userID === user.userID);
                    currentUsername = currentUsername[0].username;
                    users = users.filter(x => x.userID !== user.userID);
                    user.username = user.firstName + user.lastName;
                    user.username = user.username.toLowerCase();
                    user.username = user.username.replace(/\s+/g, '');
                    for (let record of users) {
                      if (record.username === user.username) {
                        validated = false;
                        error = "Username is already in use.";
                        break;
                      } else if (record.email === user.email) {
                        validated = false;
                        error = "Email is already in use.";
                        break;
                      }
                    }
                    if (!validated) {
                      res.send({ result: "invalid", title: "Invalid Input", msg: error, serverMsg: "" });
                    } else {
                      new sql.Request(connection)
                        .query("SELECT username, email, active, notify FROM Users WHERE userID = '" + _id + "'")
                        .then(function(userInfo) {
                          if (!userInfo[0].notify && !userInfo[0].active && user.notify) {
                            var randomstring = Math.random().toString(36).slice(-8);
                            randomstring = randomstring.charAt(0).toUpperCase() + randomstring.slice(1);
                            var salt = bcrypt.genSaltSync(10);
                            // Hash the password with the salt
                            var password = bcrypt.hashSync(randomstring, salt);
                            req.body.password = password;
                            new sql.Request(connection)
                              .query("UPDATE Users SET password='" + password + "' WHERE userID = '" + _id + "'")
                              .then(function() {
                                let mailOptions = {
                                  from: mail.user, // sender address
                                  to: user.email, // recipient address
                                  subject: 'Welcome!', // Subject line
                                  text: '', // plain text body
                                  html: 'Your username is <b>' + userInfo[0].username + '</b> and here is your new temporary password: <b>' + randomstring + '</b><br /> Please login at ' + site_settings.url + '  <br /><br /> Thankyou'// html body
                                };
                                new MailService().sendMessage("Welcome Staff", mailOptions);
                              }).catch(function(err) {
                                console.log("Update user password " + err);
                                res.send({ result: "error", title: "Error", msg: "There was an error updating the users password.", serverMSg: err });
                              });
                          }
                          new sql.Request(connection)
                            .query("UPDATE Staff SET firstName='" + user.firstName + "', lastName='" + user.lastName + "' WHERE userID = '" + _id + "'")
                            .then(function() {
                              new sql.Request(connection)
                                .query("UPDATE Users SET userType='" + user.userType + "', username='" + user.username + "', email='" + user.email + "', notify='" + user.notify + "' WHERE userID = '" + _id + "'")
                                .then(function() {
                                  if(currentUsername != user.username && user.notify) {
                                    let mailOptions = {
                                      from: mail.user, // sender address
                                      to: user.email, // recipient address
                                      subject: 'Username Update!', // Subject line
                                      text: '', // plain text body
                                      html: 'Your username has been updated to <b>' + user.username + '</b>.<br /><br /> Login at ' + site_settings.url + '  <br /><br /> Thankyou'// html body
                                    };
                                    new MailService().sendMessage("Username Update", mailOptions);
                                  }
                                  res.send({ result: "success", title: "Update Success!", msg: "Staff user updated!", serverMsg: "" });
                                }).catch(function(err) {
                                  console.log("Update user " + err);
                                  res.send({ result: "error", title: "Error", msg: "There was an error updating this users information.", serverMsg: err });
                                });
                            }).catch(function(err) {
                              console.log("Update staff " + err);
                              res.send({ result: "error", title: "Error", msg: "There was an error updating this users information.", serverMsg: err });
                            });
                        }).catch(function(err) {
                          console.log("Select notify and active from user " + err);
                          res.send({ result: "error", title: "Error", msg: "There was an error retrieving 'notify' and 'active' info for this user.", serverMsg: err });
                        });
                    }
                  }).catch(function(err) {
                    console.log("Error - Select username and email from user " + err);
                    res.send({ result: "error", title: "Error", msg: "There was an error retrieving 'username' and 'email' for this user.", serverMsg: err });
                  });
              }).catch(function(err) {
                console.log("DB Connection error: " + err);
                res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
              });
          }
        }
      });
    } catch (err) {
      console.log("Update staff record by ID: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error updating this users information.", serverMsg: err });
    }
  }

  /* Delete selected record from Staff table by ID  */
  delete(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var _id: string = req.params._id;
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("DELETE FROM Staff WHERE userID = '" + _id + "'")
                .then(function() {
                  new sql.Request(connection)
                    .query("DELETE FROM Users WHERE userID = '" + _id + "'")
                    .then(function() {
                      res.send({ result: "success", title: "User Deleted", msg: "Staff user deleted successfully.", serverMsg: "" });
                    }).catch(function(err) {
                      console.log("Delete user with id " + _id + ". " + err);
                      res.send({ result: "error", title: "Error", msg: "There was an error deleting this user from the users table.", serverMsg: err });
                    });
                }).catch(function(err) {
                  console.log("Delete staff with id " + _id + ". " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error deleting this user from the staff table.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (err) {
      console.log("Delete selected record from Staff table by ID: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error deleting this user.", serverMsg: err });
    }
  }

  /* Get all staff records from Staff table */
  retrieve(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query('SELECT Staff.firstName, Staff.lastName, Users.userID, Users.userType, Users.email, Users.active, Users.username, Users.notify FROM Staff LEFT JOIN Users ON Users.userID = Staff.userID')
                .then(function(recordset) {
                  res.send(recordset);
                }).catch(function(err) {
                  console.log("Select all staff " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error retrieving all staff information.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (err) {
      console.log("Get all staff records from Staff table: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error retrieving all staff information.", serverMsg: err });
    }
  }

  /* Get staff info by ID */
  findById(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var _id: string = req.params._id;
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("SELECT Staff.userID, firstName, lastName, email, userType, active, notify FROM Staff INNER JOIN Users ON Staff.userID = Users.userID WHERE Staff.userID = '" + _id + "'")
                .then(function(recordset) {
                  res.send(recordset[0]);
                }).catch(function(err) {
                  console.log("Select staff info by id " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error getting this users information.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (err) {
      console.log("Get staff info by ID: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error getting this users information.", serverMsg: err });
    }
  }

}

export = StaffController;
