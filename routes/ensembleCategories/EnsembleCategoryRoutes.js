const express = require("express")

const EnsembleCategoryController = require("../../controllers/ensembleCategories/EnsembleCategoryController")

const router = express.Router()

router.get("/ensembleCategories", EnsembleCategoryController.getAllCategories)
router.post("/ensembleCategories", EnsembleCategoryController.createCategory)
router.get("/ensembleCategories/:categoryId", EnsembleCategoryController.getOneCategory)
router.put("/ensembleCategories/:categoryId", EnsembleCategoryController.updateCategory)
router.delete("/ensembleCategories/:categoryId", EnsembleCategoryController.deleteCategory)


module.exports = router 