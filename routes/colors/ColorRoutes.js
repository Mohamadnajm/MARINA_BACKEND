const express = require("express");
const ColorController = require("../../controllers/colors/ColorController");

const router = express.Router();

// Authentication routes
router.get("/colors", ColorController.getColors);
router.get("/colors/:colorId", ColorController.getColor);
router.post("/colors", ColorController.createColor);
router.put("/colors/:colorId", ColorController.updateColor);
router.delete("/colors/:colorId", ColorController.deleteColor);

module.exports = router;
