const EnsembleCategory = require("../../models/ensembleCategories/EnsembleCategory");
const Ensemble = require("../../models/ensembles/Ensemble");
const HTTP_STATUS = require("../../utils/HTTP");
class EnsembleCategoryController {
  static getAllCategories = async (req, res) => {
    try {
        const categories = await EnsembleCategory.find().sort({createdAt : -1}).populate("ensembles");
      if (!categories) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "No category were found" });
      }
      return res.status(HTTP_STATUS.OK).json({ categories: categories || [] });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  static getOneCategory = async (req, res) => {
    const { categoryId } = req.params;
    try {
      const category = await EnsembleCategory.findOne({ _id: categoryId }).populate({
        path: "ensembles",
        populate: { path: "creator" }, // Populate the 'color' field inside the 'articles'
      });
      if (!category) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Category not found" });
      }
      return res.status(HTTP_STATUS.OK).json({ category: category || {} });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  static createCategory = async (req, res) => {
    const { name, description, ensembles } = req.body;
    try {
      // Check if category already exists
      const alreadyExist = await EnsembleCategory.findOne({ name });
      if (alreadyExist) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .json({ message: "Category already exists" });
      }
// console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",req.body)
      let verifiedEnsembles = [];

      // Check and verify ensembles
      if (ensembles && ensembles.length > 0) {
        for (const ensembleId of ensembles) {
          const ensemble = await Ensemble.findOne({ _id: ensembleId });
          if (ensemble) {
            verifiedEnsembles.push(ensemble._id);
          }
        }
      }

      // Create new category
      const newCategory = new EnsembleCategory({
        name,
        description,
        ensembles: verifiedEnsembles,
      });

      // Save the new category
      await newCategory.save();

      return res
        .status(HTTP_STATUS.CREATED)
        .json({ message: "New ensemble category created successfully" });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  static updateCategory = async (req, res) => {
    const categoryId = req.params.categoryId; // Assuming you have the category ID in the request parameters
    const { name, description, ensembles } = req.body;

    try {
      // Check if category exists
      const category = await EnsembleCategory.findById(categoryId);
      if (!category) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Category not found" });
      }

      // Check if the new name is not already taken by another category
      if (name && name !== category.name) {
        const alreadyExist = await EnsembleCategory.findOne({ name });
        if (alreadyExist) {
          return res
            .status(HTTP_STATUS.CONFLICT)
            .json({ message: "Category name already exists" });
        }
      }

      let verifiedEnsembles = [];

      // Check and verify ensembles
      if (ensembles && ensembles.length > 0) {
        for (const ensembleId of ensembles) {
          const ensemble = await Ensemble.findOne({ _id: ensembleId });
          if (ensemble) {
            verifiedEnsembles.push(ensemble._id);
          }
        }
      }

      // Update category fields
      category.name = name || category.name;
      category.description = description || category.description;
      category.ensembles =
        verifiedEnsembles.length > 0 ? verifiedEnsembles : category.ensembles;
        console.log("Current category state:", category);

      // Save the updated category
      await category.save();
      console.log("Updated category:", category);

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "Ensemble category updated successfully",category });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  static deleteCategory = async (req, res) => {
    const {categoryId} = req.params; 
    try {
      // Check if category exists
      const category = await EnsembleCategory.findById(categoryId);
      if (!category) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Category not found" });
      }

      // Delete the category
      await EnsembleCategory.findByIdAndDelete(category._id);

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "Ensemble category deleted successfully" });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };
}

module.exports = EnsembleCategoryController;
