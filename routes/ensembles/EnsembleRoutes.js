const express = require("express");

const EnsembleController = require("../../controllers/ensemble/EnsembleController");

const router = express.Router();
const upload = require("../../helpers/multerConfig");

router.get("/ensembles", EnsembleController.getAllEnsembles);
router.get("/ensembles/:ensembleId", EnsembleController.getOneEnsemble);
router.post("/ensembles", upload.single("img") , EnsembleController.createEnsemble);
router.put("/ensembles/:ensembleId", upload.single("img")  , EnsembleController.updateEnsemble);
router.delete("/ensembles/:ensembleId", EnsembleController.deleteEnsemble);

module.exports = router;
