import express = require("express");
import jwt = require('jsonwebtoken');
import bcrypt = require('bcrypt');
const MailService = require("../services/MailService");
const ActivityService = require("../services/ActivityService");
var sql = require('mssql');
const config = require('../config');
const db = config.db;
const mail = config.mail;
const site_settings = config.site_settings;

class AuthController {

  // Login Authentication
  auth(req: express.Request, res: express.Response): void {
    try {
      var _username: string = req.body.username;
      var _password: string = req.body.password;
      var response;

      sql.connect(db)
        .then(function(connection) {
          sql.query
            `SELECT * FROM Users WHERE username = ${_username}`
            .then(function(user) {
              if (user.length > 0) {
                if (bcrypt.compareSync(_password, user[0].password)) {
                  new ActivityService().reportActivity('Login', 'success', user[0].userID, _username + ' was successfully logged in.');
                  var token = jwt.sign({ userid: user[0].userID }, "f9b574a2fc0d77986cb7ebe21a0dea480f5f21931abfa5cf329a45ecc0c8e1ff");
                  var statusToken = { status: 200, body: { token: token, userID: user[0].userID, username: user[0].username, userType: user[0].userType, active: user[0].active } };
                  response = JSON.stringify(statusToken);
                } else {
                  new ActivityService().reportActivity('Login', 'fail', user[0].userID, _username + ' attempted to log in but entered the wrong password.');
                  response = false;
                }
              } else {
                new ActivityService().reportActivity('Login', 'fail', '', 'Attempted login as: ' + _username + '. This username does not exist.');
                response = false;
              }
              res.send(response);
            }).catch(function(err) {
              console.log("Error - Login: " + err);
              res.send({ result: "error", title: "Error", msg: "There was an error logging in.", serverMsg: "" });
            });
        }).catch(function(err) {
          console.log("DB Connection error - Login: " + err);
          res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
        });

    } catch (err) {
      console.log("Error - Login: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error logging in.", serverMsg: "" });
    }
  }

  //Decode token and check if user is authorized
  authUser(req: express.Request, res: express.Response, data): void {
    try {
      if (req.headers && req.headers.authorization) {
        jwt.verify(req.headers.authorization, 'f9b574a2fc0d77986cb7ebe21a0dea480f5f21931abfa5cf329a45ecc0c8e1ff', function(err, decoded) {
          if (err) {
            return res.send({ error: "There was an error" });
          } else {
            if (decoded === null || Object.keys(decoded).length === 0) {
              return res.send({ error: "No values in token" });
            }
          }
          var _id = decoded.userid;

          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query(`SELECT * FROM Users WHERE userID = ${_id}`)
                .then(function(user) {
                  var hasSome = data.requiredAuth.some(function(v) {
                    return user[0].userType.indexOf(v) >= 0;
                  })
                  if (hasSome) {
                    try {
                      data.done();
                    } catch (err) {
                      console.log(err.stack);
                      throw "There was an issue in the logic done after the authentication"; // This will throw to catch on line 83
                    }
                  } else {
                    res.send({ status: '403' });
                  }
                }).catch(function(err) {
                  console.log("Error - Get user by id: " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error authenticating the current user.", serverMsg: "" });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Authenticate user: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });

        });
      } else {
        res.send({ error: "No auth header" });
      }
    } catch (err) {
      console.log("Error - Authenticate user: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error authenticating the current user.", serverMsg: "" });
    }
  }

  resetPassword(req: express.Request, res: express.Response): void {
    try {
      var _userID: string = req.body.userID;
      var _password: string = req.body.password;
      var salt = bcrypt.genSaltSync(10);
      // Hash the password with the salt
      _password = bcrypt.hashSync(_password, salt);

      sql.connect(db)
        .then(function(connection) {
          sql.query
            `UPDATE Users SET password=${_password}, active='true' WHERE userID = ${_userID}`
            .then(function(recordset) {
              res.send({ result: "success", title: "Success!", msg: "Please log in using your new password.", serverMsg: "" });
            }).catch(function(err) {
              console.log("Update user password " + err);
              res.send({ result: "error", title: "Error", msg: "There was an error resetting your password.", serverMsg: "" });
            });
        }).catch(function(err) {
          console.log(err);
          res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: "" });
        });

    } catch (err) {
      console.log("Error - Reset password: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error resetting your password.", serverMsg: "" });
    }
  }

  requestReset(req: express.Request, res: express.Response): void {
    try {
      var _email: string = req.params._email;
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      var emailValidation = re.test(_email);
      var randomstring = Math.random().toString(36).slice(-8);
      randomstring = randomstring.charAt(0).toUpperCase() + randomstring.slice(1);
      var salt = bcrypt.genSaltSync(10);
      // Hash the password with the salt
      var _password = bcrypt.hashSync(randomstring, salt);
      if (!emailValidation) {
        res.send({ result: "invalid", title: "Invalid", msg: "Please enter a proper email address. (example@email.com)", serverMsg: "" })
      } else {
        sql.connect(db)
          .then(function(connection) {
            new sql.Request(connection)
              .query(`UPDATE Users SET password = '${_password}', active = 'false' WHERE email = '${_email}'`)
              .then(function(result) {
                console.log(result);
                if (result != null) {
                  // setup email data with unicode symbols
                  let mailOptions = {
                    from: mail.user, // sender address
                    to: _email, // list of receivers
                    subject: 'Password Reset', // Subject line
                    text: '', // plain text body
                    html: 'Here is your new temporary password: <b>' + randomstring + '</b><br /> Please login at ' + site_settings.url + ' <br /><br /> Thankyou'// html body
                  };
                  new ActivityService().reportActivity('Request Password Reset', 'success', '', 'Password reset accepted. Instructions for login sent to ' + _email + '.');
                  new MailService().sendMessage(" Reset Password", mailOptions);
                } else {
                  new ActivityService().reportActivity('Request Password Reset', 'fail', '', 'Could not find user with email ' + _email + '.');
                }
                res.send({ result: "success", title: "Success!", msg: "Check your email for reset instructions.", serverMsg: "" });
              }).catch(function(err) {
                console.log("Update user password " + err);
                res.send({ result: "error", title: "Error", msg: "There was an error requesting password reset.", serverMsg: "" });
              });
          }).catch(function(err) {
            console.log(err);
            res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: "" });
          });
      }


    } catch (err) {
      console.log("Error - Request password reset: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error requesting password reset.", serverMsg: "" });
    }
  }

}
export = AuthController;
