import express = require("express");
import ClientController = require("../controllers/ClientController");

var router = express.Router();
class ClientRoutes {
    private _clientController: ClientController;

    constructor () {
        this._clientController = new ClientController();
    }
    get routes () {
        var controller = this._clientController;

        router.get("/clients", controller.retrieve);
        router.post("/clients", controller.create);
        router.post("/clients/:_id", controller.addSuitability);
        router.put("/suitability-update", controller.updateSuitability);
        router.put("/general-info-update", controller.updateGeneralInfo);
        router.put("/bannerCamBool-update", controller.updateBannerCamBool);
        router.get("/clients/:_id", controller.findById);
        router.delete("/clients/:_id", controller.delete);
        router.delete("/clients/:_id/remove", controller.removeFromTable);
        router.post("/add-assessment-results", controller.addAssessmentResults);
        router.put("/edit-assessment-results", controller.editAssessmentResults);
        return router;
    }


}

Object.seal(ClientRoutes);
export = ClientRoutes;
