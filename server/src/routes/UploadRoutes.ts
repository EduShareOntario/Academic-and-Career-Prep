import express = require("express");
import multer = require("multer");
import moment = require("moment");
const uploads = __dirname + '/../../../uploads';
const fs = require('fs');

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploads)
  },
  filename: function(req, file, cb) {
    console.log(file);
    cb(null, Date.now() + '_' + file.originalname);
  }
});
var upload = multer({storage: storage});

var router = express.Router();

class UploadRoutes {
    constructor () {

    }
    get routes () {
        router.get("/getFiles", function(req, res) {
          var filesList = [];
          fs.readdir(uploads, (err, files) => {
            files.forEach(file => {
              if(file === '.gitkeep') {
              } else {
                var fileSplitNameID = file.split(/_(.+)/)[1];
                var fileSplitName = fileSplitNameID.split(/_(.+)/)[1];
                var fileSplitID = fileSplitNameID.split(/_(.+)/)[0];
                var fileSplitDate = file.split(/_(.+)/)[0];
                var toInt = parseInt(fileSplitDate);
                var dateObj = new Date(toInt);
                var formattedDate = moment(dateObj).format('MMMM Do YYYY, h:mm:ss a');
                //fileSplitDate.date = new Date(fileSplitDate.dateInMillionSeconds);
                //var fileDate = new Date(fileSplitDate).toISOString();
                var fileInfo = {
                  filename: fileSplitName,
                  userID: fileSplitID,
                  date: formattedDate,
                  milliseconds: fileSplitDate
                };
                filesList.push(fileInfo);
              }
            });
            res.send(filesList);
          });
        });

        router.post("/download/:_file", function(req, res){
          try {
            var _filename: string = req.params._file;
            var downloadFile;
            fs.readdir(uploads, (err, files) => {
              files.forEach(file => {
                if(file === _filename) {
                  downloadFile = file;
                }
              });
              res.setHeader('Content-disposition', 'attachment; filename=' + downloadFile);
              res.setHeader('Content-type', 'application/pdf');
              var fileData = fs.readFileSync(__dirname + "/../../../uploads/" + downloadFile);
              var base64Data = new Buffer(fileData).toString('base64');
              res.send(base64Data);
              //res.download(__dirname + "/../../../uploads/" + downloadFile, 'binary');
            });
          } catch(e) {
            res.send({status: "error"});
          }

        });

        router.delete("/deleteFile/:_file", function(req, res){
          var _filename: string = req.params._file;
          fs.readdir(uploads, (err, files) => {
            files.forEach(file => {
              if(file === _filename) {
                fs.unlink(__dirname + "/../../../uploads/" + _filename, function (err) {
                  if(err) {
                    console.log(err);
                  }
                });
                res.send('success');
              }
            });
          });
        });

        router.post("/uploadFile", upload.any(), function (req, res, next) {
          res.end('file uploaded');
          // req.files is array of `photos` files
          console.log("studentID: " + req.body.studentID);
        })
        return router;
    }
}

Object.seal(UploadRoutes);
export = UploadRoutes;
