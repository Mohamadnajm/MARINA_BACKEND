const express = require("express");
const SupplierController =
  require("../../controllers/Suppliers/SupplierController");

const router = express.Router();

// Authentication routes
router.get("/suppliers", SupplierController.getSupplier);
router.post("/suppliers", SupplierController.createSupplier);
router.delete("/suppliers/:id", SupplierController.deleteSupplier);
router.put("/suppliers/status/:id", SupplierController.toggleStatus);
router.put("/suppliers/:id", SupplierController.updateSupplier);

module.exports = router;
