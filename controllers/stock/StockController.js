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
}

module.exports = StockController;
