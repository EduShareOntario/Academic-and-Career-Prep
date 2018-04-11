import express = require("express");
import jwt = require('jsonwebtoken');
import bcrypt = require('bcrypt');
import AuthController = require("../controllers/AuthController");
import ClientController = require("../controllers/ClientController");
const MailService = require("../services/MailService");
const PRFService = require("../services/PRFService");
var sql = require('mssql');
var auth = ["Admin", "Staff", "Client"];

var config = require('../config');
config = config.db;

class ClientFormsController {
  consentForm(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff", "Client", "Student"], done: function() {
          var consentForm = req.body.consentForm;
          var _id: string = req.params._id;
          sql.connect(config)
            .then(function(connection) {
              var consentQuery = "'" + _id + "', '" +
                consentForm.date + "', '" +
                consentForm.ontarioWorks + "', '" +
                consentForm.owCaseWorkerName + "', '" +
                consentForm.owCaseWorkerPhone + "', '" +
                consentForm.owCaseWorkerEmail + "', '" +
                consentForm.ontarioDisabilityProgram + "', '" +
                consentForm.odspAgencyName + "', '" +
                consentForm.odspContactName + "', '" +
                consentForm.odspPhone + "', '" +
                consentForm.odspEmail + "', '" +
                consentForm.employmentInsurance + "', '" +
                consentForm.employmentServices + "', '" +
                consentForm.esAgencyName + "', '" +
                consentForm.esContactName + "', '" +
                consentForm.esPhone + "', '" +
                consentForm.esEmail + "', '" +
                consentForm.wsib + "', '" +
                consentForm.wsibWtsName + "', '" +
                consentForm.wsibWtsPhone + "', '" +
                consentForm.other + "', '" +
                consentForm.contactName + "', '" +
                consentForm.contactNum + "', '" +
                consentForm.literacyAgencies + "', '" +
                consentForm.literacyWitness + "'";
              new sql.Request(connection)
                .query("INSERT INTO Consent VALUES (" + consentQuery + ")")
                .then(function() {
                  new sql.Request(connection)
                    .query("UPDATE Clients SET consent='false', editConsentPermission='false' WHERE userID = '" + _id + "'")
                    .then(function() {
                      new sql.Request(connection)
                        .query("UPDATE Students SET editConsentPermission='false' WHERE userID = '" + _id + "'")
                        .then(function() {
                          res.send({ "success": "success" });
                        }).catch(function(err) {
                          res.send({ "error": "error" });
                          console.log("Update student " + err);
                        });
                    }).catch(function(err) {
                      res.send({ "error": "error" });
                      console.log("Update client " + err);
                    });
                }).catch(function(err) {
                  console.log("Save consent form " + consentQuery);
                  res.send({ "error": "error" });
                });
            });
        }
      });
    } catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
    }
  }

  getConsentById(req: express.Request, res: express.Response) {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: ["Admin", "Staff", "Client", "Student"], done: function() {
          var _id: string = req.params._id;
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query('SELECT * FROM Consent WHERE userID = ' + _id + '')
                .then(function(consentForm) {
                  res.send(consentForm);
                }).catch(function(err) {
                  res.send({ "error": "error" });
                  console.log("Get consent by id " + err);
                });
            });
        }
      });
    } catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
    }
  }

  editConsentRequest(req: express.Request, res: express.Response) {
    var _id: string = req.params._id;
    sql.connect(config)
      .then(function(connection) {
        new sql.Request(connection)
          .query('SELECT firstName, lastName FROM Clients WHERE userID = ' + _id + '')
          .then(function(client) {
            new sql.Request(connection)
              .query("UPDATE Clients SET editConsentRequest = 'true' WHERE userID = " + _id + "")
              .then(function(result) {
                client = client[0];
                var mailOptions = {
                  from: 'Georgian Academic & Career Prep', // sender address
                  to: 'academic.career.prep@gmail.com', // client.email
                  subject: client.firstName + ' ' + client.lastName + ' Request to Edit Consent (Client)', // Subject line
                  text: '', // plain text body
                  html: 'Client ' + client.firstName + ' ' + client.lastName + ' wants to edit their consent form.<br/> Please login to the clients page at: https://gcacademicprep.azurewebsites.net/#/clients. Search for '+ client.firstName + ' ' + client.lastName + ' in the clients table, select View Info from the dropdown then select Consent to grant or deny access.'// html body
                };
                new MailService().sendMessage("Request to Edit Consent", mailOptions);
                res.send({ status: "success" });
              }).catch(function(err) {
                res.send({ status: "error" });
                console.log("editConsentRequest: Update request to edit" + err);
              });
          }).catch(function(err) {
            res.send({ status: "error" });
            console.log("editConsentRequest: Select first and last name" + err);
          });
      });

  }

  grantConsentEditPermission(req: express.Request, res: express.Response) {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var permission = req.body.permission;
          var client = req.body.client;
          console.log("Value: " + permission + ', ' + "UserID: " + client.userID );
          if (permission) {
            sql.connect(config)
              .then(function(connection) {
                new sql.Request(connection)
                  .query("UPDATE Clients SET editConsentRequest = 'false' WHERE userID = " + client.userID)
                  .then(function(result1) {
                    new sql.Request(connection)
                      .query("UPDATE Clients SET editConsentPermission = 'true' WHERE userID = " + client.userID)
                      .then(function(result2) {
                        new sql.Request(connection)
                          .query("SELECT email FROM users WHERE userID = " + client.userID)
                          .then(function(clientEmail) {
                            var mailOptions = {
                              from: 'Georgian Academic & Career Prep', // sender address
                              to: clientEmail[0].email, // client.email
                              subject: 'Request Granted!', // Subject line
                              text: '', // plain text body
                              html: 'You can now login at: https://gcacademicprep.azurewebsites.net and make changes to your consent form.'// html body
                            };
                            new MailService().sendMessage("Consent Edit Request Granted", mailOptions);
                            res.send({status: "granted"});
                          }).catch(function(err) {
                            res.send({ "error": "error" });
                            console.log("grantConsentEditPermission: Get email for user. " + err);
                          });
                      }).catch(function(err) {
                        res.send({ "error": "error" });
                        console.log("grantConsentEditPermission: Set consent equal to true(needs to be completed). " + err);
                      });
                  }).catch(function(err) {
                    res.send({ "error": "error" });
                    console.log("grantConsentEditPermission: Set editConsentRequest equal to false. " + err);
                  });
              });
          } else {
            res.send({status: "denied"});
          }
        }
      });
    } catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
    }
  }

  getLearningStyleById(req: express.Request, res: express.Response) {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var _id: string = req.params._id;
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query('SELECT * FROM LearningStyle WHERE userID = ' + _id + '')
                .then(function(learningStlyeForm) {
                  res.send(learningStlyeForm);
                }).catch(function(err) {
                  res.send({ "error": "error" });
                  console.log("Get consent by id " + err);
                });
            });
        }
      });
    } catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
    }
  }

  learningStyleForm(req: express.Request, res: express.Response): void {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var learningStyleForm = req.body.learningStyleForm;
          var _id: string = req.params._id;
          sql.connect(config)
            .then(function(connection) {
              var learningStyleQuery = "'" + _id + "', '" +
                learningStyleForm.seeing + "', '" +
                learningStyleForm.hearing + "', '" +
                learningStyleForm.doing + "', '" +
                learningStyleForm.learnBy + "'";
              new sql.Request(connection)
                .query("INSERT INTO LearningStyle VALUES (" + learningStyleQuery + ")")
                .then(function() {
                  new sql.Request()
                    .query("UPDATE Clients SET learningStyle= 'false' WHERE userID = '" + _id + "'")
                    .then(function() {
                      res.send({ "success": "success" });
                    }).catch(function(err) {
                      res.send({ "error": "error" });
                      console.log("Update client " + err);
                    });
                }).catch(function(err) {
                  console.log("Save learning style form " + err);
                  res.send({ "error": "error" });
                });
            });
        }
      });
    } catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
    }
  }

  getAllFormsByID(req: express.Request, res: express.Response) {
    try {
      new AuthController().authUser(req, res, {
        requiredAuth: auth, done: function() {
          var _id: string = req.params._id;
          sql.connect(config)
            .then(function(connection) {
              new sql.Request(connection)
                .query('SELECT * FROM SuitabilityForm WHERE userID = ' + _id + '')
                .then(function(suitabilityForm) {
                  new sql.Request(connection)
                    .query('SELECT * FROM Consent WHERE userID = ' + _id + '')
                    .then(function(consentForm) {
                      new sql.Request(connection)
                        .query('SELECT * FROM LearningStyle WHERE userID = ' + _id + '')
                        .then(function(learningStyleForm) {
                          res.send({
                            suitabilityForm: suitabilityForm,
                            consentForm: consentForm,
                            learningStyleForm: learningStyleForm
                          });
                        }).catch(function(err) {
                          res.send({ "error": "error" });
                          console.log("Get learningStyleForms " + err);
                        });
                    }).catch(function(err) {
                      res.send({ "error": "error" });
                      console.log("Get consentForms " + err);
                    });
                }).catch(function(err) {
                  res.send({ "error": "error" });
                  console.log("Get suitabilityForms " + err);
                });
            });
        }
      });
    } catch (e) {
      console.log(e);
      res.send({ "error": "error in your request" });
    }
  }

}
export = ClientFormsController;
