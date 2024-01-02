const express = require("express");
const ArticleController = require("../../controllers/articles/ArticleController");
const AuthenticatedUser = require("../../helpers/AuthenticatedUser");

const router = express.Router();

// Authentication routes
router.get("/articles", ArticleController.getArticles);
router.get("/articles/:articleId", ArticleController.getArticle);
router.post("/articles", AuthenticatedUser, ArticleController.createArticle);
router.put("/articles/:articleId", ArticleController.updateArticle);
router.put("/articles/status/:articleId", ArticleController.toggleStatus);
router.delete("/articles/:articleId", ArticleController.deleteArticle);

module.exports = router;
