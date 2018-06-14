import express = require("express");
import jwt = require('jsonwebtoken');
import bcrypt = require('bcrypt');
import AuthController = require("../controllers/AuthController");
const MailService = require("../services/MailService");
const ActivityService = require("../services/ActivityService");
var sql = require('mssql');
var auth = ["Admin", "Staff"];
const config = require('../config');
const db = config.db;
const mail = config.mail;
const site_settings = config.site_settings;

class ClientController {

  create(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var randomstring = Math.random().toString(36).slice(-8);
          randomstring = randomstring.charAt(0).toUpperCase() + randomstring.slice(1);
          var salt = bcrypt.genSaltSync(10);
          // Hash the password with the salt
          var password = bcrypt.hashSync(randomstring, salt);
          req.body.client.password = password;
          var client = req.body.client;
          client.username = client.firstName + client.lastName;
          client.username = client.username.toLowerCase();
          client.username = client.username.replace(/\s+/g, '');
          var suitabilityForm = req.body.suitabilityForm;
          var active = false;
          var mailOptions;

          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("SELECT username, email FROM Users")
                .then(function(users) {
                  var validated = true;
                  var error;
                  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                  var emailValidation = re.test(client.email);
                  client.editConsentPermission = false;
                  client.editConsentRequest = false;
                  for (let user of users) {
                    if (user.username === client.username) {
                      validated = false;
                      error = "username in use";
                      break;
                    }
                    if (client.email === "BA.ACP@georgiancollege.ca" || client.email === "OR.ACP@georgiancollege.ca" || client.email === "OS.ACP@georgiancollege.ca") {
                      client.password = bcrypt.hashSync(site_settings.client_pass, salt);
                      active = true;
                      // setup email data with unicode symbols
                      mailOptions = {
                        from: mail.user, // sender address
                        to: '', // client.email
                        subject: 'New Client Created', // Subject line
                        text: '', // plain text body
                        html: 'A new client has been created. Username is <b>' + client.username + '</b> and password is <b>Georgian2018</b><br />. Please assist the client when logging in for the first time at ' + site_settings.url + '. <br /><br /> Thankyou' // html body
                      };
                    } else {
                      // setup email data with unicode symbols
                      mailOptions = {
                        from: mail.user, // sender address
                        to: client.email, // list of receivers
                        subject: 'Welcome, ' + client.firstName, // Subject line
                        text: '', // plain text body
                        html: 'Your username is <b>' + client.username + '</b> and your temporary password is: <b>' + randomstring + '</b><br /> Please login at ' + site_settings.url + ' and complete the required forms. <br /><br /> Thankyou' // html body
                      };
                      if (user.email === client.email) {
                        validated = false;
                        error = "email in use";
                        break;
                      }
                    }
                  }
                  if (!emailValidation && validated) {
                    validated = false;
                    error = "incorrect email format";
                  }
                  if (validated) {
                    new sql.Request(connection)
                      .query("INSERT INTO Users VALUES ('" + client.username + "','" + client.email + "','" + client.password + "','Client','" + active + "','True')")
                      .then(function() {
                        new sql.Request(connection)
                          .query("SELECT userID FROM Users WHERE username = '" + client.username + "' AND password = '" + client.password + "'")
                          .then(function(id) {
                            if (client.okayToText == null) {
                              client.okayToText = false;
                              console.log();
                            } else if (client.alternateNumber == null) {
                              client.alternateNumber = false;
                            }
                            var clientQuery = "'" + id[0].userID + "', '" +
                              client.firstName + "', '" +
                              client.lastName + "', '" +
                              client.inquiryDate + "', '" +
                              client.birthday + "', '" +
                              client.phone + "', '" +
                              client.allowDetailedMessage + "', '" +
                              client.okayToText + "', '" +
                              client.alternateNumber + "', '" +
                              client.allowDetailedMessageAlternate + "', '" +
                              client.okayToTextAlternate + "', '" +
                              true + "', '" +
                              true + "', '" +
                              true + "', '" +
                              false + "', '" +
                              false + "', '" +
                              client.comments + "', '" +
                              client.studentNumber + "', '" +
                              client.editConsentRequest + "', '" +
                              client.editConsentPermission + "'";
                            try {
                              new MailService().sendMessage("Welcome Message", mailOptions);
                            } catch (err) {
                              console.log(err);
                            }
                            new sql.Request().query("INSERT INTO Clients VALUES (" + clientQuery + ")").then(function() {
                              if (Object.keys(suitabilityForm).length != 0) {
                                var suitabilityFormQuery = "'" + id[0].userID
                                  + "', '" + suitabilityForm.transcript
                                  + "', '" + suitabilityForm.courses
                                  + "', '" + suitabilityForm.goal
                                  + "', '" + suitabilityForm.transitionDate
                                  + "', '" + suitabilityForm.governmentID
                                  + "', '" + suitabilityForm.appropriateGoal
                                  + "', '" + suitabilityForm.isValidAge
                                  + "', '" + suitabilityForm.schoolRegistration
                                  + "', '" + suitabilityForm.availableDuringClass
                                  + "', '" + suitabilityForm.lastGrade
                                  + "', '" + suitabilityForm.level
                                  + "', '" + suitabilityForm.offerStartDate
                                  + "', '" + suitabilityForm.meetsGoal
                                  + "', '" + suitabilityForm.timeOutOfSchool
                                  + "', '" + suitabilityForm.inProgramBefore
                                  + "', '" + suitabilityForm.employment
                                  + "', '" + suitabilityForm.incomeSource
                                  + "', '" + suitabilityForm.ageRange
                                  + "', '" + suitabilityForm.hoursPerWeek
                                  + "', '" + suitabilityForm.workHistory
                                  + "', '" + suitabilityForm.factorHealth
                                  + "', '" + suitabilityForm.factorInstructions
                                  + "', '" + suitabilityForm.factorCommunication
                                  + "', '" + suitabilityForm.factorLanguage
                                  + "', '" + suitabilityForm.factorComputer
                                  + "', '" + suitabilityForm.factorHousing
                                  + "', '" + suitabilityForm.factorTransportation
                                  + "', '" + suitabilityForm.factorDaycare
                                  + "', '" + suitabilityForm.factorInternet
                                  + "', '" + suitabilityForm.factorPersonal
                                  + "', '" + suitabilityForm.factorOther
                                  + "', '" + suitabilityForm.summaryTransportation
                                  + "', '" + suitabilityForm.summaryHousing
                                  + "', '" + suitabilityForm.summaryChildcare
                                  + "', '" + suitabilityForm.summaryHealth
                                  + "', '" + suitabilityForm.summaryOther
                                  + "', '" + suitabilityForm.dbTotalPoints
                                  + "', '" + suitabilityForm.generalInfoComments + "'";
                                new sql.Request(connection)
                                  .query("INSERT INTO SuitabilityForm VALUES (" + suitabilityFormQuery + ")")
                                  .then(function() {
                                    console.log("Suitability inserted");
                                    new sql.Request(connection)
                                      .query("UPDATE Clients SET suitability= 'false' WHERE userID = '" + id[0].userID + "'")
                                      .then(function() {
                                        new ActivityService().reportActivity('New Client Created', 'success', id[0].userID,  client.firstName + ' ' + client.lastName + ' has been created as a new client user.');
                                        res.send({ result: "success", title: "Success!", msg: "Client has been created successfully!", serverMsg: "" });
                                      }).catch(function(err) {
                                        console.log("Update client " + err);
                                        res.send({ result: "error", title: "Error", msg: "There was an error creating new client.", serverMsg: err });
                                      });
                                  }).catch(function(err) {
                                    console.log("insert suitabilityForm " + err);
                                    res.send({ result: "error", title: "Error", msg: "There was an error adding users suitability info.", serverMsg: err });
                                  });
                              } else {
                                console.log("Suitability not provided.");
                                new ActivityService().reportActivity('New Client Created', 'success', id[0].userID,  client.firstName + ' ' + client.lastName + ' has been created as a new client user.');
                                res.send({ result: "success", title: "Success!", msg: "Client has been created successfully!", serverMsg: "" });
                              }
                            }).catch(function(err) {
                              console.log("Error - insert client, removing from users table: " + err);
                              new sql.Request(connection)
                                .query("DELETE FROM Users WHERE userID = '" + id[0].userID + "'")
                                .then(function() {
                                  res.send({ result: "error", title: "Error", msg: "There was an error creating this client.", serverMsg: err });
                                }).catch(function(err) {
                                  console.log("Error - Delete user with id " + id[0].userID + ": " + err);
                                  res.send({ result: "error", title: "Error", msg: "There was an error removing client from users table.", serverMsg: err });
                                });
                            });
                          }).catch(function(err) {
                            console.log("Error - get client from users table: " + err);
                            res.send({ result: "error", title: "Error", msg: "There was an error getting user info for this client.", serverMsg: err });
                          });
                      }).catch(function(err) {
                        console.log("Error - insert client users table: " + err);
                        res.send({ result: "error", title: "Error", msg: "There was an error inserting this client into the users table.", serverMsg: err });
                      });
                  } else {
                    res.send({ result: "invalid", title: "Invalid", msg: error, serverMsg: "" });
                  }
                }).catch(function(err) {
                  console.log(err);
                  res.send({ result: "error", title: "Error", msg: "There was an error selecting all users.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Create new client: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (err) {
      console.log("Error - Create new client: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error creating new client.", serverMsg: err });
    }
  }

  addSuitability(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var _id: string = req.params._id;
          var suitabilityForm = req.body;

          sql.connect(db)
            .then(function(connection) {

              var suitabilityFormQuery = "'" + _id
                + "', '" + suitabilityForm.transcript
                + "', '" + suitabilityForm.courses
                + "', '" + suitabilityForm.goal
                + "', '" + suitabilityForm.transitionDate
                + "', '" + suitabilityForm.governmentID
                + "', '" + suitabilityForm.appropriateGoal
                + "', '" + suitabilityForm.isValidAge
                + "', '" + suitabilityForm.schoolRegistration
                + "', '" + suitabilityForm.availableDuringClass
                + "', '" + suitabilityForm.lastGrade
                + "', '" + suitabilityForm.level
                + "', '" + suitabilityForm.offerStartDate
                + "', '" + suitabilityForm.meetsGoal
                + "', '" + suitabilityForm.timeOutOfSchool
                + "', '" + suitabilityForm.inProgramBefore
                + "', '" + suitabilityForm.employment
                + "', '" + suitabilityForm.incomeSource
                + "', '" + suitabilityForm.ageRange
                + "', '" + suitabilityForm.hoursPerWeek
                + "', '" + suitabilityForm.workHistory
                + "', '" + suitabilityForm.factorHealth
                + "', '" + suitabilityForm.factorInstructions
                + "', '" + suitabilityForm.factorCommunication
                + "', '" + suitabilityForm.factorLanguage
                + "', '" + suitabilityForm.factorComputer
                + "', '" + suitabilityForm.factorHousing
                + "', '" + suitabilityForm.factorTransportation
                + "', '" + suitabilityForm.factorDaycare
                + "', '" + suitabilityForm.factorInternet
                + "', '" + suitabilityForm.factorPersonal
                + "', '" + suitabilityForm.factorOther
                + "', '" + suitabilityForm.summaryTransportation
                + "', '" + suitabilityForm.summaryHousing
                + "', '" + suitabilityForm.summaryChildcare
                + "', '" + suitabilityForm.summaryHealth
                + "', '" + suitabilityForm.summaryOther
                + "', '" + suitabilityForm.dbTotalPoints
                + "', '" + suitabilityForm.generalInfoComments + "'";
              new sql.Request(connection)
                .query("INSERT INTO SuitabilityForm VALUES (" + suitabilityFormQuery + ")")
                .then(function() {
                  new sql.Request(connection)
                    .query("UPDATE Clients SET suitability = 'false' WHERE userID = " + _id + "")
                    .then(function() {
                      new ActivityService().reportActivity('Suitability Added', 'success', _id, 'Suitability has been created for client with user ID: ' + _id);
                      res.send({ result: "success", title: "Success!", msg: "Client suitability has been initialized!", serverMsg: "" });
                    }).catch(function(err) {
                      console.log("Error - Update suitability: " + err);
                      res.send({ result: "error", title: "Error", msg: "There was an error adding suitability for client.", serverMsg: err });
                    });
                }).catch(function(err) {
                  console.log("Error - Insert suitability: " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error adding suitability for client.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Add suitability: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (err) {
      console.log("Error - Add suitability: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error adding suitability for client.", serverMsg: err });
    }
  }

  updateBannerCamBool(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var client = req.body;
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("UPDATE Clients SET banner='" + client.banner + "', cam='" + client.cam + "' WHERE clientID = '" + client.clientID + "'")
                .then(function(recordset) {
                  res.send({ result: "success", title: "Success!", msg: "Banner/CAM checkboxes updated.", serverMsg: "" });
                }).catch(function(err) {
                  console.log("Error - Update banner/cam booleans: " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error updating Banner/CAM checks.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Update Banner/CAM booleans: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (err) {
      console.log("Error - Update Banner/CAM booleans: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error updating Banner/CAM checks.", serverMsg: err });
    }
  }

  updateGeneralInfo(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var client = req.body;
          var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          var emailValidation = re.test(client.email);
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
                    var currentUsername = users.filter(x => x.userID === client.userID);
                    currentUsername = currentUsername[0].username;
                    users = users.filter(x => x.userID !== client.userID);
                    client.username = client.firstName + client.lastName;
                    client.username = client.username.toLowerCase();
                    client.username = client.username.replace(/\s+/g, '');
                    for (let record of users) {
                      if (record.username === client.username) {
                        validated = false;
                        error = "Username is already in use.";
                        break;
                      } else if (record.email === client.email && record.email !== "BA.ACP@georgiancollege.ca" && record.email !== "OR.ACP@georgiancollege.ca" && record.email !== "OS.ACP@georgiancollege.ca") {
                        validated = false;
                        error = "Email is already in use.";
                        break;
                      }
                    }
                    if (!validated) {
                      res.send({ result: "invalid", title: "Invalid Input", msg: error, serverMsg: "" });
                    } else {
                      var clientsQuery = "UPDATE Clients SET studentNumber='" + client.studentNumber
                        + "', firstName='" + client.firstName
                        + "', lastName='" + client.lastName
                        + "', phone='" + client.phone
                        + "', allowDetailedMessage ='" + client.allowDetailedMessage
                        + "', okayToText='" + client.okayToText
                        + "', alternateNumber='" + client.alternateNumber
                        + "', allowDetailedMessageAlternate='" + client.allowDetailedMessageAlternate
                        + "', okayToTextAlternate='" + client.okayToTextAlternate
                        + "', comments='" + client.comments
                        + "' WHERE clientID = '" + client.clientID + "'"
                      new sql.Request(connection)
                        .query(clientsQuery)
                        .then(function(clientsResult) {
                          var usersQuery = "UPDATE Users SET email='" + client.email
                            + "', username='" + client.username +"' WHERE userID = '" + client.userID + "'"
                          new sql.Request(connection)
                            .query(usersQuery)
                            .then(function(usersResult) {
                              if (currentUsername != client.username) {
                                let mailOptions = {
                                  from: mail.user, // sender address
                                  to: client.email, // recipient address
                                  subject: 'Username Update!', // Subject line
                                  text: '', // plain text body
                                  html: 'Your username has been changed to <b>' + client.username + '</b>.<br /><br /> Login at ' + site_settings.url + '  <br /><br /> Thankyou'// html body
                                };
                                new MailService().sendMessage("Client Username Update", mailOptions);
                              }
                              new ActivityService().reportActivity('General Info Update', 'success', client.userID,  'General info for ' + client.fullName + ' has been updated.');
                              res.send({ result: "success", title: "Success!", msg: "Client general info updated!", serverMsg: "" });
                            }).catch(function(err) {
                              console.log("Error - Update user info: " + err);
                              res.send({ result: "error", title: "Error", msg: "There was an error updating client user info.", serverMsg: err });
                            });
                        }).catch(function(err) {
                          console.log("Error - Update client gerneal info: " + err);
                          res.send({ result: "error", title: "Error", msg: "There was an error updating client general info.", serverMsg: err });
                        });
                      }
                    }).catch(function(err) {
                      console.log("Error - Get userID, username and email from users table: " + err);
                      res.send({ result: "error", title: "Error", msg: "There was an error retrieving user info.", serverMsg: err });
                    });
              }).catch(function(err) {
                console.log("DB Connection error - Update client general info: " + err);
                res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
              });
          }
        }
      });
    } catch (err) {
      console.log("Error - Update client general info: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error updating client general info.", serverMsg: err });
    }
  }

  updateSuitability(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var suitability = req.body;
          sql.connect(db)
            .then(function(connection) {
              var query = "UPDATE SuitabilityForm SET transcript='" + suitability.transcript
                + "', courses='" + suitability.courses
                + "', goal='" + suitability.goal
                + "', transitionDate='" + suitability.transitionDate
                + "', governmentID='" + suitability.governmentID
                + "', appropriateGoal='" + suitability.appropriateGoal
                + "', isValidAge='" + suitability.isValidAge
                + "', schoolRegistration='" + suitability.schoolRegistration
                + "', availableDuringClass='" + suitability.availableDuringClass
                + "', lastGrade='" + suitability.lastGrade
                + "', level='" + suitability.level
                + "', offerStartDate='" + suitability.offerStartDate
                + "', meetsGoal='" + suitability.meetsGoal
                + "', timeOutOfSchool='" + suitability.timeOutOfSchool
                + "', inProgramBefore='" + suitability.inProgramBefore
                + "', employment='" + suitability.employment
                + "', incomeSource='" + suitability.incomeSource
                + "', ageRange='" + suitability.ageRange
                + "', hoursPerWeek='" + suitability.hoursPerWeek
                + "', workHistory='" + suitability.workHistory
                + "', factorHealth='" + suitability.factorHealth
                + "', factorInstructions='" + suitability.factorInstructions
                + "', factorCommunication='" + suitability.factorCommunication
                + "', factorLanguage='" + suitability.factorLanguage
                + "', factorComputer='" + suitability.factorComputer
                + "', factorHousing='" + suitability.factorHousing
                + "', factorTransportation='" + suitability.factorTransportation
                + "', factorDaycare='" + suitability.factorDaycare
                + "', factorInternet='" + suitability.factorInternet
                + "', factorPersonal='" + suitability.factorPersonal
                + "', factorOther='" + suitability.factorOther
                + "', summaryTransportation='" + suitability.summaryTransportation
                + "', summaryChildcare='" + suitability.summaryChildcare
                + "', summaryHealth='" + suitability.summaryHealth
                + "', summaryOther='" + suitability.summaryOther
                + "', points='" + suitability.points
                + "' WHERE suitabilityID = '" + suitability.suitabilityID + "'"
              new sql.Request(connection)
                .query(query)
                .then(function(recordset) {
                  new ActivityService().reportActivity('Suitability Update', 'success', suitability.suitabilityID,  'Suitability has been updated for client with user ID: ' + suitability.suitabilityID);
                  res.send({ result: "success", title: "Success!", msg: "Suitability updated.", serverMsg: "" });
                }).catch(function(err) {
                  console.log("Error - Update suitability: " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error updating suitability.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Update suitability: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    }
    catch (err) {
      console.log("Error - Update suitability: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error updating suitability.", serverMsg: err });
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
                .query("DELETE FROM Clients WHERE userID = '" + _id + "'")
                .then(function() {
                  new sql.Request(connection)
                    .query("DELETE FROM Users WHERE userID = '" + _id + "'")
                    .then(function() {
                      new ActivityService().reportActivity('Client Deleted', 'success', _id,  'Client with user ID ' + _id + ' has been deleted.');
                      res.send({ result: "success", title: "Success!", msg: "Client deleted.", serverMsg: "" });
                    }).catch(function(err) {
                      console.log("Error - Delete user with id " + _id + ": " + err);
                      res.send({ result: "error", title: "Error", msg: "There was an error deleting client.", serverMsg: err });
                    });
                }).catch(function(err) {
                  console.log("Error - Delete client with id " + _id + ": " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error deleting client.", serverMsg: err });
                });

            }).catch(function(err) {
              console.log("DB Connection error - Delete client user: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (err) {
      console.log("Error - Delete client: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error deleting client.", serverMsg: err });
    }
  }

  removeFromTable(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var _id: string = req.params._id;
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("DELETE FROM Clients WHERE userID = '" + _id + "'")
                .then(function() {
                  new sql.Request(connection)
                    .query("UPDATE Users SET userType= 'Student' WHERE userID = '" + _id + "'")
                    .then(function() {
                      new ActivityService().reportActivity('Client Transfered', 'success', _id,  'Client with id: ' + _id + ' has been transferred to the students table.');
                      res.send({ result: "success", title: "Transfer Successful!", msg: "Client is now a student user.", serverMsg: "" });
                    }).catch(function(err) {
                      console.log("Update user userType " + err);
                      res.send({ result: "error", title: "Error", msg: "There was an error updating the userType.", serverMsg: err });
                    });
                }).catch(function(err) {
                  console.log("Delete form client table with id " + _id + ". " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error removing user from client table.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Remove client from clients table:" + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (err) {
      console.log("Error - Remove from clients table and update userType to student: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error transferring client to student table.", serverMsg: err });
    }
  }

  retrieve(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query('SELECT Clients.*, Users.email, Users.active from Clients Left JOIN Users ON Clients.userID = Users.userID')
                .then(function(clients) {
                  new sql.Request(connection)
                    .query('SELECT * FROM SuitabilityForm')
                    .then(function(suitabilityForms) {
                      new sql.Request(connection)
                        .query('SELECT * FROM Consent')
                        .then(function(consentForms) {
                          new sql.Request(connection)
                            .query('SELECT * FROM LearningStyle')
                            .then(function(learningStyleForms) {
                              new sql.Request(connection)
                                .query('SELECT * FROM AssessmentResults')
                                .then(function(assessmentResults) {
                                  res.send({
                                    clients: clients,
                                    suitabilityForms: suitabilityForms,
                                    consentForms: consentForms,
                                    learningStyleForms: learningStyleForms,
                                    assessmentResults: assessmentResults
                                  });
                                }).catch(function(err) {
                                  console.log("Error - Get assessmentResults: " + err);
                                  res.send({ result: "error", title: "Error", msg: "There was an error retrieving all assessmentResults.", serverMsg: err });
                                });
                            }).catch(function(err) {
                              console.log("Error - Get learningStyleForms: " + err);
                              res.send({ result: "error", title: "Error", msg: "There was an error retrieving all learning style forms.", serverMsg: err });
                            });
                        }).catch(function(err) {
                          console.log("Error - Get consentForms: " + err);
                          res.send({ result: "error", title: "Error", msg: "There was an error retrieving all consent forms.", serverMsg: err });
                        });
                    }).catch(function(err) {
                      console.log("Error - Get suitabilityForms: " + err);
                      res.send({ result: "error", title: "Error", msg: "There was an error retrieving all suitability forms.", serverMsg: err });
                    });
                }).catch(function(err) {
                  console.log("Error - Get clients: " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error retrieving all clients.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Retrieve all clients: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (err) {
      console.log("Error - Retrieve all clients: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error retrieving all clients.", serverMsg: err });
    }
  }

  findById(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff", "Client"], done: function() {
          var _id: string = req.params._id;
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("SELECT * FROM Clients WHERE userID = '" + _id + "'")
                .then(function(client) {
                  res.send(client);
                }).catch(function(err) {
                  console.log("Error - Get client by id: " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error retrieving client by id.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Find client by id: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (err) {
      console.log("Error - Find client by id: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error retrieving client by id.", serverMsg: err });
    }
  }

  addAssessmentResults(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff"], done: function() {
          var assessmentResults = req.body;
          sql.connect(db)
            .then(function(connection) {
              var assessmentResultsQuery = "'" + assessmentResults.userID + "', '" +
                assessmentResults.readingComp1 + "', '" +
                assessmentResults.readingComp2 + "', '" +
                assessmentResults.readingComp3 + "', '" +
                assessmentResults.numeracy + "', '" +
                assessmentResults.digital + "'";
              new sql.Request(connection)
                .query("INSERT INTO AssessmentResults VALUES (" + assessmentResultsQuery + ")")
                .then(function() {
                  new ActivityService().reportActivity('Form Submitted', 'success', assessmentResults.userID, 'Assessment results added.');
                    res.send({ result: "success", title: "Results Submitted", msg: "Assessment results have been successfully submitted.", serverMsg: "" });
                }).catch(function(err) {
                  console.log("Add Assessment Results form : " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error adding new assessment results.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Submit Assessment Results: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (err) {
      console.log("Error - Add Assessment Results: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error adding new assessment results.", serverMsg: err });
    }
  }

  editAssessmentResults(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff"], done: function() {
          var assessmentResults = req.body;
          sql.connect(db)
            .then(function(connection) {
              new sql.Request(connection)
                .query("UPDATE AssessmentResults SET readingComp1='" + assessmentResults.readingComp1 + "', readingComp2='" + assessmentResults.readingComp2 + "', readingComp3 ='" + assessmentResults.readingComp3 + "', numeracy='" + assessmentResults.numeracy + "', digital='" + assessmentResults.digital + "' WHERE assessmentID='" + assessmentResults.assessmentID + "'")
                .then(function() {
                  new ActivityService().reportActivity('Form Submitted', 'success', assessmentResults.userID, 'Assessment results updated.');
                    res.send({ result: "success", title: "Results Updated", msg: "Assessment results have been successfully updated.", serverMsg: "" });
                }).catch(function(err) {
                  console.log("Update Assessment Results form : " + err);
                  res.send({ result: "error", title: "Error", msg: "There was an error updating assessment results.", serverMsg: err });
                });
            }).catch(function(err) {
              console.log("DB Connection error - Submit Assessment Results: " + err);
              res.send({ result: "error", title: "Connection Error", msg: "There was an error connecting to the database.", serverMsg: err });
            });
        }
      });
    } catch (err) {
      console.log("Error - Update Assessment Results: " + err);
      res.send({ result: "error", title: "Error", msg: "There was an error updating assessment results.", serverMsg: err });
    }
  }

}
export = ClientController;
