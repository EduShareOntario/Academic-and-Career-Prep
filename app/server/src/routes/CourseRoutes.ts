import express = require("express");
import CourseController = require("../controllers/CourseController");

var router = express.Router();
class CourseRoutes {
    private _CourseController: CourseController;

    constructor() {
        this._CourseController = new CourseController();
    }
    get routes() {
        var controller = this._CourseController;

        router.get("/course", controller.retrieve);
        router.get("/instructor-courses/:_id", controller.getInstructorCourses);
        router.post("/course", controller.create);
        router.put("/course/:_id", controller.update);
        router.get("/course/:_id", controller.findById);
        router.get("/wait-list", controller.getWaitList);
        router.get("/wait-list-by-id/:_id", controller.getWaitListById);
        router.post("/addToWaitList", controller.addToWaitList);
        router.post("/addToCourseTypes", controller.addToCourseTypes);
        router.delete("/course/:_id", controller.delete);
        router.get("/getInstructors", controller.getInstructors);
        router.get("/getCampuses", controller.getCampuses);
        router.get("/getCourseTypes", controller.getCourseTypes);
        return router;
    }
}

Object.seal(CourseRoutes);
export = CourseRoutes;
