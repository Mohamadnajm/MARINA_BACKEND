const express = require("express");
const ArticleController = require("../../controllers/articles/ArticleController");
const AuthenticatedUser = require("../../helpers/AuthenticatedUser");

const router = express.Router();
const upload = require("../../helpers/multerConfig");

// Authentication routes
router.get("/articles", ArticleController.getArticles);
router.get("/articles/:articleId", ArticleController.getArticle);
router.post("/articles", AuthenticatedUser, upload.single("img"), ArticleController.createArticle);
router.put("/articles/:articleId",  upload.single("img") , ArticleController.updateArticle);
router.put("/articles/status/:articleId", ArticleController.toggleStatus);
router.delete("/articles/:articleId", ArticleController.deleteArticle);

module.exports = router;
