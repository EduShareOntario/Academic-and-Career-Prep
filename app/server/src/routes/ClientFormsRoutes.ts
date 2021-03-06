import express = require("express");
import ClientFormsController = require("../controllers/ClientFormsController");

var router = express.Router();
class ClientFormsRoutes {
    private _clientFormsController: ClientFormsController;

    constructor () {
        this._clientFormsController = new ClientFormsController();
    }
    get routes () {
        var controller = this._clientFormsController;

        router.post("/clientForms/:_id/consent", controller.consentForm);
        router.put("/clientForms/:_id/requestEditConsent", controller.editConsentRequest);
        router.put("/clientForms/grantConsentEditPermission", controller.grantConsentEditPermission);
        router.post("/clientForms/:_id/learningStyle", controller.learningStyleForm);
        router.get("/clientForms/:_id", controller.getAllFormsByID);
        router.get("/clientForms/consent/:_id", controller.getConsentById);
        router.get("/clientForms/learningStyle/:_id", controller.getLearningStyleById);
        router.get("/clientForms/learningStyle/:_id", controller.getLearningStyleById);
        return router;
    }


}

Object.seal(ClientFormsRoutes);
export = ClientFormsRoutes;
