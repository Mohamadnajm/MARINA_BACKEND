const express = require("express");
const CatalogController = require("../../controllers/catalogs/CatalogController");

const router = express.Router();

// Authentication routes
router.get("/catalogs", CatalogController.getCatalogs);
router.get("/catalogs/:catalogId", CatalogController.getCatalog);
router.post("/catalogs", CatalogController.createCatalog);
router.put("/catalogs/:catalogId", CatalogController.updateCatalog);
router.put("/catalogs/status/:catalogId", CatalogController.toggleStatus);
router.delete("/catalogs/:catalogId", CatalogController.deleteCatalog);

module.exports = router;
