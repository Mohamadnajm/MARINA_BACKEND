const Article = require("../../models/articles/Article");
const Color = require("../../models/colors/Colors");
const Supplier = require("../../models/suppliers/Supplier");
const Catalog = require("../../models/catalogs/Catalog");
const Category = require("../../models/categories/Category");
const User = require("../../models/users/User");
const GenerateAchatReference = require("./AchatRefsGenerator");
const HTTP_STATUS = require("../../utils/HTTP");
const Achat = require("../../models/achat/Achat");
const Stock = require("../../models/stock/Stock");
const fs = require("fs");
class ArticleController {
  // Get All Articles
  static getArticles = async (req, res) => {
    const { search, color, catalog, weight, type, price, sellPrice } =
      req.query;
    const query = {};
    try {
      if (search != undefined) {
        query.name = { $regex: new RegExp(search, "i") };
      }

      if (color != undefined) {
        const selectedColor = await Color.findOne({ _id: color });
        if (!selectedColor) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ message: "Color not found" });
        }
        query.color = selectedColor._id;
      }
      if (catalog) {
        const selectedCatalog = await Catalog.findOne({ name: catalog });
        if (!selectedCatalog) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ message: "Catalog not found" });
        }
        query.catalog = selectedCatalog._id;
      }

      if (type) {
        query.typeArticle = type;
      }

      if (weight) {
        query.weight = weight;
      }

      if (sellPrice) {
        query.sellPrice = sellPrice;
      }

      if (price) {
        query.buyPrice = price;
      }

      const articles = await Article.find(query)
        .populate("createdBy color supplier catalog")
        .sort({ createdAt: -1 });
      if (!articles) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "No article were found" });
      }
      return res.status(HTTP_STATUS.OK).json({ articles: articles || [] });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // Get One Article By Id
  static getArticle = async (req, res) => {
    const { articleId } = req.params;
    try {
      const article = await Article.findOne({ _id: articleId }).populate(
        "createdBy color supplier catalog"
      );
      if (!article) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "No article were found" });
      }

      //get article's count in the stock
      const stockArticle = await Stock.findOne({ article: article._id });

      // Extract the count from stockArticle if it exists
      const countArticle = stockArticle ? stockArticle.stock : 0;

      // Add countArticle attribute to the article object
      const articleWithCount = { ...article.toJSON(), countArticle };

      return res
        .status(HTTP_STATUS.OK)
        .json({ article: articleWithCount || {} });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // Add Articles
  static createArticle = async (req, res) => {
    const actor = req.user;
    const {
      // status,
      name,
      description,
      weight,
      img,
      color,
      typeArticle,
      countArticle,
      // catalog,
      supplier,
      sellPrice,
      buyPrice,
      category,
      barCode,
      // nbrOfArticles,
      // date,
      // idBase
      // cout
    } = req.body;
    try {
      if (
        !name ||
        !description ||
        !weight ||
        !color ||
        !typeArticle ||
        !countArticle ||
        !supplier ||
        !sellPrice ||
        !category ||
        !buyPrice ||
        !barCode
      ) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Please fill all the fields" });
      }

      const selectedCatalog = await Catalog.findOne({ _id: category }).populate(
        "articles"
      );
      if (!selectedCatalog) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Category Not Found" });
      }

      //color check
      const selectedColor = await Color.findOne({ _id: color });
      if (!selectedColor) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Color not found" });
      }

      //supplier check
      const selectedSupplier = await Supplier.findOne({ _id: supplier });
      if (!selectedSupplier) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Supplier not found" });
      }

      // if (!filename || !originalname || !fileType) {
      //   return res
      //     .status(HTTP_STATUS.BAD_REQUEST)
      //     .json({ message: "Please upload an article image " });
      // }
      //catalog check
      // const selectedCatalog = await Catalog.findOne({ _id: catalog });
      // if (!selectedCatalog) {
      //   return res
      //     .status(HTTP_STATUS.NOT_FOUND)
      //     .json({ message: "Catalog not found" });
      // }

      //creating new article
      const newArticle = new Article({
        name,
        description,
        weight,
        color: selectedColor._id,
        typeArticle,
        supplier: selectedSupplier._id,
        sellPrice,
        buyPrice,
        catalog: category,
        barCode,
        createdBy: actor._id,
      });

      if (req.file) {
        const { filename, originalname, fileType } = req.file;
        if (!filename || !originalname || !fileType) {
          return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ message: "Invalid image !" });
        }
        newArticle.img = { filename, originalname, fileType };
      }
      await newArticle.save();
      selectedSupplier.articles.push(newArticle);
      await selectedSupplier.save();
      selectedCatalog.articles.push(newArticle);
      await selectedCatalog.save();

      const ref = await GenerateAchatReference();

      const newAchat = new Achat({
        ref,
        article: newArticle._id,
        countArticle,
        supplier: selectedSupplier._id,
        typeArticle,
        totalweight: Number(weight) * Number(countArticle),
        total: Number(buyPrice) * Number(countArticle),
      });
      await newAchat.save();

      let existingStock = await Stock.findOne({ articlebarCode: barCode });

      if (existingStock) {
        // If the article is already in stock, update the stock quantity
        existingStock.stock += countArticle;
        await existingStock.save();
      } else {
        // If the article is not in stock, create a new stock entry
        const newStock = new Stock({
          article: newArticle._id,
          stock: countArticle,
        });
        await newStock.save();
      }

      res
        .status(HTTP_STATUS.CREATED)
        .json({ message: "New article created successfully", newArticle });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // Edit Articles
  static updateArticle = async (req, res) => {
    const { articleId } = req.params;
    const {
      name,
      description,
      weight,
      color,
      typeArticle,
      number,
      catalog,
      supplier,
      sellPrice,
      buyPrice,
      category,
      createdBy,
      img,
    } = req.body;

    try {
      const article = await Article.findOne({ _id: articleId });

      if (!article) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Article not found" });
      }

      // Update properties only if they are provided in the request body

      if (name) article.name = name;
      if (description) article.description = description;
      if (weight) article.weight = weight;
      // if (img) article.img = img;
      if (color) {
        const selectedColor = await Color.findOne({ _id: color });
        if (!selectedColor) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ message: "Color not found" });
        }
        article.color = selectedColor._id;
      }
      if (typeArticle) article.typeArticle = typeArticle;
      if (number) article.countArticle = number;
      if (catalog) {
        // Find the selected catalog
        const selectedCatalog = await Catalog.findOne({ _id: catalog });

        // Check if the selected catalog exists
        if (!selectedCatalog) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ message: "Catalog not found" });
        }

        // Remove the article from the old catalog's articles array
        const oldCatalog = await Catalog.findOne({ _id: article.catalog });
        if (oldCatalog) {
          oldCatalog.articles = oldCatalog.articles.filter(
            (e) => e._id != articleId
          );
          await oldCatalog.save(); // Save oldCatalog sequentially
        }

        // Update the article's catalog to the selected catalog
        article.catalog = selectedCatalog._id;

        // Add the article to the selected catalog's articles array
        selectedCatalog.articles.push(article);

        // Save the updated selected catalog
        await selectedCatalog.save();
      }
      if (supplier) {
        const selectedSupplier = await Supplier.findOne({ _id: supplier });
        if (!selectedSupplier) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ message: "Supplier not found" });
        }

        // Remove the article from the old supplier's articles array
        const oldSupplier = await Supplier.findOne({ _id: article.supplier });
        oldSupplier.articles = oldSupplier.articles.filter(
          (e) => e._id != articleId
        );
        await oldSupplier.save(); // Save oldSupplier sequentially

        // Add the article to the new supplier's articles array
        selectedSupplier.articles.push(article);

        // Save the updated new supplier
        await selectedSupplier.save(); // Save selectedSupplier sequentially

        article.supplier = selectedSupplier._id;
      }
      if (sellPrice) article.sellPrice = sellPrice;
      if (buyPrice) article.buyPrice = buyPrice;
      if (category) {
        const selectedCatalog = await Catalog.findOne({ _id: category });
        if (!selectedCategory) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ message: "Category not found" });
        }
        article.createdBy = selectedCatalog._id;
      }
      if (createdBy) {
        const selectedUser = await User.findOne({ _id: createdBy });
        if (!selectedUser) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ message: "User not found" });
        }
        article.createdBy = selectedUser._id;
      }
      if (req.file) {
        const { filename, originalname, fileType } = req.file;

        const filePath = `./uploads/articles/${article.img.filename}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        article.img = { filename, originalname, fileType };
      }

      await article.save();

      res
        .status(HTTP_STATUS.OK)
        .json({ message: "Article updated successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // Toggle Status
  static toggleStatus = async (req, res) => {
    const { articleId } = req.params;
    try {
      const article = await Article.findOne({ _id: articleId });
      if (!article) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Article not found" });
      }
      const articleStatusUpdated = await Article.findByIdAndUpdate(
        article._id,
        {
          status: !article.status,
        },
        { new: true }
      );
      return res.status(HTTP_STATUS.OK).json({
        message: "Article Status Updated successfully",
        Catalog: articleStatusUpdated,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  };

  // Delete Articles
  static deleteArticle = async (req, res) => {
    const { articleId } = req.params;

    try {
      const article = await Article.findOne({ _id: articleId });
      if (!article) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Article not found" });
      }
      const catalogs = await Catalog.find({ articles: articleId });

      // Remove the article from the catalogs' articles array
      catalogs.forEach(async (catalog) => {
        catalog.articles = catalog.articles.filter(
          (catalogArticleId) => catalogArticleId.toString() !== articleId
        );
        await catalog.save();
      });

      // Delete the article
      await Article.findByIdAndDelete(articleId);

      const filePath = `./uploads/articles/${article.img.filename}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "File not found" });
      }

      res
        .status(HTTP_STATUS.OK)
        .json({ message: "Article deleted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };
}

module.exports = ArticleController;
