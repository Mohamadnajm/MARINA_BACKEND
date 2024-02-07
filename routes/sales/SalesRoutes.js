const express = require("express");
const SalesController = require("../../controllers/sales/SalesController");

const router = express.Router();

router.get("/sales", SalesController.getAllSales);
router.get("/sales/:saleId", SalesController.getOneSale);
router.post("/sales", SalesController.createSale);
router.put("/sales/:saleId", SalesController.updateSale);
router.put("/sales/payments/:saleId", SalesController.addPayment);
router.put("/sales/payments/:saleId/:paymentId", SalesController.editPayment);
router.delete("/sales/payments/:saleId/:paymentId", SalesController.deletePayment);
router.delete("/sales/:saleId", SalesController.deleteSale);


router.post('/verifyQte', SalesController.verifyQte)

module.exports = router;
