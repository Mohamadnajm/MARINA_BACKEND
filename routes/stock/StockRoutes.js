const express = require("express");
const StockController = require("../../controllers/stock/StockController");

const router = express.Router();

router.get("/stock", StockController.getStock);

module.exports = router;
