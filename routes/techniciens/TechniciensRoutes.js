const express = require("express");

const TechnicienController = require("../../controllers/techniciens/TechnicienController");
const router = express.Router();

router.get("/techniciens", TechnicienController.getAllTechniciens);
router.get("/techniciens/:technicienId", TechnicienController.getOneTechnicien);
router.post("/techniciens", TechnicienController.createTechnicien);
router.put("/techniciens/:technicienId", TechnicienController.updateTechnicien);
router.delete("/techniciens/:technicienId", TechnicienController.deleteTechnicien);

module.exports = router;
