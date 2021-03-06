import express = require("express");
import StudentController = require("../controllers/StudentController");

var router = express.Router();
class StudentRoutes {
    private _studentController: StudentController;

    constructor () {
        this._studentController = new StudentController();
    }
    get routes () {
        var controller = this._studentController;

        router.get("/students", controller.retrieve);
        router.get("/get-student-archive", controller.getStudentArchive);
        router.post("/students", controller.create);
        router.post("/archive-student", controller.archiveStudent);
        router.post("/get-students-id", controller.getStudentsById);
        router.put("/students/general-info-update", controller.updateGeneralInfo);
        router.put("/students/:_id/requestEditConsent", controller.editConsentRequest);
        router.put("/students/grantConsentEditPermission", controller.grantConsentEditPermission);
        router.get("/students/:_id", controller.findById);
        router.post("/enroll", controller.addToTimetable);
        router.delete("/drop/:_userID/:_courseID", controller.removeFromTimetable);
        router.get("/timetables", controller.getTimetables);
        router.get("/timetables-course-id/:_courseID", controller.getTimetablesByCourseId);
        router.get("/timetable/:userID", controller.getTimetablesByUserId);
        router.post("/caseNotes/:_userID", controller.createNote);
        router.get("/caseNotes/:_userID", controller.getNote);
        router.delete("/caseNotes/:_id", controller.deleteNote);
        router.post("/attendance", controller.insertAttendance);
        router.get("/attendance-report", controller.getAllAttendance);
        router.put("/students/attendance-check", controller.runScheduledEmails);
        router.get("/prf/:_id", controller.populatePRF);
        return router;
    }


}

Object.seal(StudentRoutes);
export = StudentRoutes;
