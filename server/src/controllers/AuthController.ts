import express = require("express");
import jwt = require('jsonwebtoken');
import bcrypt = require('bcrypt');
const MailService = require("../services/MailService");
var sql = require('mssql');

var config = require('../config');
config = config.db;

class AuthController {

  // Login Authentication
  auth(req: express.Request, res: express.Response): void {
    try {
      var _username: string = req.body.username;
      var _password: string = req.body.password;
      var response;

      sql.connect(config).then(function(connection) {
        sql.query`SELECT * FROM Users WHERE username = ${_username}`.then(function(user) {
            if (bcrypt.compareSync(_password, user[0].password)) {
              var token = jwt.sign({ userid: user[0].userID }, "f9b574a2fc0d77986cb7ebe21a0dea480f5f21931abfa5cf329a45ecc0c8e1ff");
              var statusToken = { status: 200, body: { token: token, userID: user[0].userID, username: user[0].username, userType: user[0].userType, active: user[0].active } };
              response = JSON.stringify(statusToken);
            } else {
              response = false;
            }
            res.send(response);
          }).catch(function(err) {
            response = { "error": err };
            res.send(response);
          });
      }).catch(function(err) {
        response = { "error": err };
        res.send(response);
      });

    }
    catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
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
          var query = "SELECT * FROM Users WHERE userID = '" + _id + "'";
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query(query)
                .then(function(user) {
                  var hasSome = data.requiredAuth.some(function(v){
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
                }).catch(err => {
                  res.send({ "error": "error" });
                  console.log(" " + err);
                });
            });
        });
      } else {
        res.send({ error: "No auth header" });
      }
    }
    catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
    }
  }

  resetPassword(req: express.Request, res: express.Response): void {
    try {
      var _userID: string = req.body.userID;
      var _password: string = req.body.password;
      var salt = bcrypt.genSaltSync(10);
      // Hash the password with the salt
      _password = bcrypt.hashSync(_password, salt);

      sql.connect(config)
        .then(function(connection) {
          new sql.Request(connection)
            .query("UPDATE Users SET password='" + _password + "', active='true' WHERE userID='" + _userID + "'")
            .then(function(recordset) {
              res.send({ "success": "success" });
            }).catch(function(err) {
              res.send({ "error": "error" });
              console.log("Update user password " + err);
            });
        }).catch(function(err) {
          console.log(err);
          res.send({ "error": "error" });
        });
    } catch (err) {
      console.log(err);
      res.send({ "error": "error in your request" });
    }
  }

  requestReset(req: express.Request, res: express.Response): void {
    try {
      var _email: string = req.params._email;
      var randomstring = Math.random().toString(36).slice(-8);
      randomstring = randomstring.charAt(0).toUpperCase() + randomstring.slice(1);
      var salt = bcrypt.genSaltSync(10);
      // Hash the password with the salt
      var _password = bcrypt.hashSync(randomstring, salt);

      sql.connect(config).then(function(connection) {
          sql.query`UPDATE Users SET password= $ {_password}, active='false' WHERE email = ${_email}`.then(function(recordset) {
              // setup email data with unicode symbols
              let mailOptions = {
                from: '"Georgian Academic & Career Prep"', // sender address
                to: _email, // list of receivers
                subject: 'Password Reset', // Subject line
                text: '', // plain text body
                html: 'Here is your new temporary password: <b>' + randomstring + '</b><br /> Please login at http://georgianapp.azurewebsites.net <br /><br /> Thankyou'// html body
              };

              new MailService().sendMessage(" Reset Password", mailOptions);
              res.send({ "success": "success" });
            }).catch(function(err) {
              res.send({ "error": "error" });
              console.log("Update user password " + err);
            });
        }).catch(function(err) {
          console.log(err);
          res.send({ "error": "error" });
        });
    } catch(err) {
      console.log(err);
      res.send({ "error": "error in your request" });
    }
  }

}
export = AuthController;
