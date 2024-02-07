const express = require("express");
const CatalogController = require("../../controllers/catalogs/CatalogController");

const router = express.Router();
const upload = require("../../helpers/multerConfig");

// Authentication routes
router.get("/catalogs", CatalogController.getCatalogs);
router.get("/catalogs/:catalogId", CatalogController.getCatalog);
router.post("/catalogs", upload.single("img"), CatalogController.createCatalog);

router.put("/catalogs/:catalogId", upload.single("img"), CatalogController.updateCatalog);
router.put("/catalogs/status/:catalogId", CatalogController.toggleStatus);
router.delete("/catalogs/:catalogId", CatalogController.deleteCatalog);

module.exports = router;
