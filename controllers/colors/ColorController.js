const HTTP_STATUS = require("../../utils/HTTP");
const Color = require("../../models/colors/Colors");

class ColorController {
  // Get Colors
  static getColors = async (req, res) => {
    try {
      const colors = await Color.find().limit(14);
      if (!colors) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "No Color were found" });
      }
      return res.status(HTTP_STATUS.OK).json({ colors });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // Get One Color
  static getColor = async (req, res) => {
    const { colorId } = req.params;
    try {
      const color = await Color.findOne({ _id: colorId });
      if (!color) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Color not found" });
      }
      return res.status(HTTP_STATUS.OK).json({ color });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // Add Color
  static createColor = async (req, res) => {
    const { name, hex } = req.body;

    try {
      if (!name || !hex) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Please fill all the fields" });
      }
      // Check if a color with the same name or hex already exists
      const colorAlreadyExist = await Color.findOne({
        $or: [{ name }, { hex }],
      });

      if (colorAlreadyExist) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .json({ message: "Color already exists" });
      }

      // If not, create a new color
      const newColor = new Color({
        name,
        hex,
      });

      await newColor.save();

      return res
        .status(HTTP_STATUS.CREATED)
        .json({ message: "New color created successfully", color: newColor });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // Update Color
  static updateColor = async (req, res) => {
    const { colorId } = req.params;
    const { name, hex } = req.body;

    try {
      // Use findByIdAndUpdate to update the existing color
      const updatedColor = await Color.findByIdAndUpdate(
        colorId,
        { name, hex },
        { new: true }
      );

      if (!updatedColor) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Color not found" });
      }

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "Color updated successfully", color: updatedColor });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // Delete Color
  static deleteColor = async (req, res) => {
    const { colorId } = req.params;

    try {
      const deletedColor = await Color.findByIdAndDelete(colorId);

      if (!deletedColor) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Color not found" });
      }

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "Color deleted successfully " });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };
}

module.exports = ColorController;
