const express = require("express");

const EnsembleController = require("../../controllers/ensemble/EnsembleController");

const router = express.Router();

router.get("/ensembles", EnsembleController.getAllEnsembles);
router.get("/ensembles/:ensembleId", EnsembleController.getOneEnsemble);
router.post("/ensembles", EnsembleController.createEnsemble);
router.put("/ensembles/:ensembleId", EnsembleController.updateEnsemble);
router.delete("/ensembles/:ensembleId", EnsembleController.deleteEnsemble);

module.exports = router;
