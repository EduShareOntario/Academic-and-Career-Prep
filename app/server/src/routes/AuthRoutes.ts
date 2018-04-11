import express = require("express");
import AuthController = require("../controllers/AuthController");

var router = express.Router();
class AuthRoutes {
    private _authController: AuthController;

    constructor () {
        this._authController = new AuthController();
    }
    get routes () {
        var controller = this._authController;

        router.post("/auth/", controller.auth);
        router.put("/resetPassword/", controller.resetPassword);
        router.get("/requestReset/:_email", controller.requestReset);

        return router;
    }
}

Object.seal(AuthRoutes);
export = AuthRoutes
