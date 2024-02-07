const Category = require("../../models/categories/Category");

const HTTP_STATUS = require("../../utils/HTTP");

class CategoryController {
  static getCategories = async (req, res) => {
    try {
      const categories = await Category.find();
      if (categories.length > 0) {
        return res.status(HTTP_STATUS.OK).json(categories);
      }
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "No Categories Found ! " });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  static getCategory = async (req, res) => {
    const { id } = req.params;
    try {
      const category = await Category.findOne({ _id: id });
      if (!category) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "No Category were found" });
      }
      return res.status(HTTP_STATUS.OK).json({ category: category || {} });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  static createCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
      if (!name || !description) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Please fill all the fields" });
      }
      const newCategory = new Category({
        name,
        description,
      });
      await newCategory.save();
      res
        .status(HTTP_STATUS.CREATED)
        .json({ message: "New Category created successfully", newCategory });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  static updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
      if (id) {
        if (!name || !description) {
          return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ message: "Please fill all the fields" });
        }
        const updatedCategory = await Category.findByIdAndUpdate(
          id,
          {
            name,
            description,
          },
          { new: true }
        );
        if (!updatedCategory) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ message: "Category not found" });
        }
        return res.status(HTTP_STATUS.OK).json({
          message: "Catalog updated successfully",
          Category: updatedCategory,
        });
      }
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Error occured" });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  static deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
      const category = await Category.findOne({ _id: id });
      if (!category) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Category not found" });
      }
      await Category.findByIdAndDelete(id);

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };
}

module.exports = CategoryController;
