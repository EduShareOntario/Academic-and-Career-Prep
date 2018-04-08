import express = require("express");
import jwt = require('jsonwebtoken');
import bcrypt = require('bcrypt');
import AuthController = require("../controllers/AuthController");
const MailService = require("../services/MailService");
var sql = require('mssql');
var auth = ["Admin", "Staff"];

var config = require('../config');
config = config.db;

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

          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query("SELECT * FROM Users")
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
                      client.password = bcrypt.hashSync("Georgian2018", salt);
                      active = true;
                      // setup email data with unicode symbols
                      mailOptions = {
                        from: '"Georgian Academic & Career Prep"', // sender address
                        to: '', // client.email
                        subject: 'New Client Created', // Subject line
                        text: '', // plain text body
                        html: 'A new client has been created. Username is <b>' + client.username + '</b> and password is <b>Georgian2018</b><br />. Please assist the client when logging in for the first time at http://georgianapp.azurewebsites.net. <br /><br /> Thankyou' // html body
                      };
                    } else {
                      // setup email data with unicode symbols
                      mailOptions = {
                        from: '"Georgian Academic & Career Prep"', // sender address
                        to: client.email, // list of receivers
                        subject: 'Welcome, ' + client.firstName, // Subject line
                        text: '', // plain text body
                        html: 'Your username is <b>' + client.username + '</b> and your temporary password is: <b>' + randomstring + '</b><br /> Please login at http://georgianapp.azurewebsites.net and complete the required forms. <br /><br /> Thankyou' // html body
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
                      .query("INSERT INTO Users VALUES ('" + client.username + "','" + client.email + "','" + client.password + "','Client','" + active + "')")
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
                                        res.send({ "success": "success" });
                                      }).catch(function(err) {
                                        res.send({ "error": "error" });
                                        console.log("Update client " + err);
                                      });
                                  }).catch(function(err) {
                                    res.send({ "error": "error" });
                                    console.log("insert suitabilityForm " + err);
                                  });
                              } else {
                                res.send({ "success": "success" });
                                console.log("Suitability not provided.");
                              }
                            }).catch(function(err) {
                              res.send({ "error": "error" });
                              console.log("insert client " + err);
                              new sql.Request(connection)
                                .query("DELETE FROM Users WHERE userID = '" + id[0].userID + "'")
                                .then(function() {
                                  res.send({ "success": "success" });
                                  console.log()
                                }).catch(function(err) {
                                  res.send({ "error": "error" });
                                  console.log("Delete user with id " + id[0].userID + ". " + err);
                                });
                            });
                          }).catch(function(err) {
                            res.send({ "error": "error selecting user from users" });
                            console.log("get user " + err);
                          });
                      }).catch(function(err) {
                        res.send({ "error": "error inserting user" });
                        console.log("insert user " + err);
                      });
                  } else {
                    res.send({ "error": error });
                  }
                }).catch(function(err) {
                  console.log(err);
                  res.send({ "error": "error selecting all users" });
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
    }
  }

  addSuitability(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var _id: string = req.params._id;
          var suitabilityForm = req.body;

          sql.connect(config)
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
                      res.send({ "success": "success" });
                    }).catch();
                }).catch();
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
    }
  }

  updateBannerCamBool(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var client = req.body;
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query("UPDATE Clients SET banner='" + client.banner + "', cam='" + client.cam + "' WHERE clientID = '" + client.clientID + "'")
                .then(function(recordset) {
                  res.send({ "success": "success" });
                }).catch(function(err) {
                  res.send({ "error": "error" });
                  console.log("Update banner and cam booleans " + err);
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
    }
  }

  updateGeneralInfo(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var client = req.body;
          sql.connect(config)
            .then(function(connection) {
              var clientsQuery = "UPDATE Clients SET studentNumber='" + client.studentNumber
                + "', firstName='" + client.firstName
                + "', lastName='" + client.lastName
                + "' WHERE clientID = '" + client.clientID + "'"
              new sql.Request(connection)
                .query(clientsQuery)
                .then(function(clientsResult) {
                  var usersQuery = "UPDATE Users SET email='" + client.email
                    + "' WHERE userID = '" + client.userID + "'"
                  new sql.Request(connection)
                    .query(usersQuery)
                    .then(function(usersResult) {
                      res.send({ "success": "success" });
                    }).catch(function(err) {
                      res.send({ "error": "error" }); console.log("Update student general info " + err);
                    });
                }).catch(function(err) {
                  res.send({ "error": "error" }); console.log("Update client gerneal info " + err);
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
    }
  }

  updateSuitability(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var suitability = req.body;
          sql.connect(config)
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
                  res.send({ "success": "success" });
                }).catch(function(err) {
                  res.send({ "error": "error" }); console.log("Update suitability " + err);
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log(e);
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
                .query("DELETE FROM Clients WHERE userID = '" + _id + "'")
                .then(function() {
                  new sql.Request(connection)
                    .query("DELETE FROM Users WHERE userID = '" + _id + "'")
                    .then(function() {
                      res.send({ "success": "success" });
                    }).catch(function(err) {
                      res.send({ "error": "error" }); console.log("Delete user with id " + _id + ". " + err);
                    });
                }).catch(function(err) {
                  res.send({ "error": "error" }); console.log("Delete client with id " + _id + ". " + err);
                });

            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
    }
  }

  removeFromTable(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var _id: string = req.params._id;
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query("DELETE FROM Clients WHERE userID = '" + _id + "'")
                .then(function() {
                  new sql.Request(connection)
                    .query("UPDATE Users SET userType= 'Student' WHERE userID = '" + _id + "'")
                    .then(function() {
                      res.send({ "success": "success" });
                    }).catch(function(err) {
                      res.send({ "error": "error" }); console.log("Update user userType " + err);
                    });
                }).catch(function(err) {
                  res.send({ "error": "error" }); console.log("Delete form client table with id " + _id + ". " + err);
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
    }
  }

  retrieve(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          sql.connect(config)
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
                              res.send({
                                clients: clients,
                                suitabilityForms: suitabilityForms,
                                consentForms: consentForms,
                                learningStyleForms: learningStyleForms
                              });
                            }).catch(function(err) {
                              res.send({ "error": "error" }); console.log("Get learningStyleForms " + err);
                            });
                        }).catch(function(err) {
                          res.send({ "error": "error" }); console.log("Get consentForms " + err);
                        });
                    }).catch(function(err) {
                      res.send({ "error": "error" }); console.log("Get suitabilityForms " + err);
                    });
                }).catch(function(err) {
                  res.send({ "error": "error" }); console.log("Get clients " + err);
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
    }
  }

  findById(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff", "Client"], done: function() {
          var _id: string = req.params._id;
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query("SELECT * FROM Clients WHERE userID = '" + _id + "'")
                .then(function(client) {
                  res.send({ client: client });
                }).catch(function(err) {
                  console.log("Get client by id " + err);
                  res.send({ "error": "error" });
                });
            }).catch(function(err) {
              console.log(err);
              res.send({ "error": "error" });
            });
        }
      });
    }
    catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
    }
  }

}
export = ClientController;
