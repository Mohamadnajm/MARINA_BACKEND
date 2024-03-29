const Stock = require("../../models/stock/Stock");
const HTTP_STATUS = require("../../utils/HTTP");

class StockController {
  static getStock = async (req, res) => {
    try {
      const stock = await Stock.find().populate({
        path: "article",
        populate: { path: "color" },
      });
      return res.status(HTTP_STATUS.OK).json({ stock: stock || [] });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  static editStock = async (req, res) => {
    const { stockId } = req.params;
    try {
      const stock = await Stock.findOne({ _id: stockId }).populate({
        path: "article",
        populate: { path: "supplier" },
      });
      if (!stock) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Stock not found" });
      }
      console.log({ stock: stock?.article?.supplier });
      console.log({ stock });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };
}

module.exports = StockController;
