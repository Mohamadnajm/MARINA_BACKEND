const Article = require("../../models/articles/Article");
const Client = require("../../models/clients/Client");
const Sale = require("../../models/sales/Sales");
const Stock = require("../../models/stock/Stock");

const HTTP_STATUS = require("../../utils/HTTP");

const GenerateSalesReference = require("./SalesRefsGenerator");

class SalesController {
  //get All Sales
  static getAllSales = async (req, res) => {
    const {
      search,
      barcode,
      client,
      status,
      date,
      weight,
      total,
      startDate,
      endDate,
    } = req.query;
    const query = {};
    try {
      if (search != undefined) {
        query.ref = { $regex: new RegExp(search, "i") };
      }

      if (barcode != undefined) {
        query.ref = { $regex: new RegExp(barcode, "i") };
      }

      if (client != undefined) {
        query.client = client;
      }

      if (status != undefined) {
        query.status = { $regex: new RegExp(status, "i") };
      }

      // if (date != undefined) {
      //   const parsedDate = new Date(date);

      //   query.createdAt = {
      //     parsedDate,
      //   };
      // }

      if (weight != undefined) {
        query.totalWeight = weight;
      }

      if (total != undefined) {
        query.total = total;
      }

      if (startDate !== undefined && endDate !== undefined) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        parsedEndDate.setDate(parsedEndDate.getDate() + 1); // End date is inclusive

        query.createdAt = {
          $gte: parsedStartDate,
          $lt: parsedEndDate,
        };
      }

      const sales = await Sale.find(query)
        .populate({
          path: "articles",
          populate: {
            path: "color", // specify the field to populate
            model: "Color", // specify the model to use for populating the 'color' field
          },
        })
        .populate("client");
      if (!sales) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "No sale were found" });
      }

      return res.status(HTTP_STATUS.OK).json({ sales });
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error });
    }
  };

  //get One Sale
  static getOneSale = async (req, res) => {
    const { saleId } = req.params;
    try {
      const sale = await Sale.findOne({ _id: saleId }).populate({
        path: "articles",
        populate: {
          path: "color", // specify the field to populate
          model: "Color", // specify the model to use for populating the 'color' field
        },
      }).populate('client')
      if (!sale) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Sale not found" });
      }

      return res.status(HTTP_STATUS.OK).json({ sale });
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error });
    }
  };

  //Create Sale
  static createSale = async (req, res) => {
    try {
      const { description, articles, clientId, date, total, qtes } = req.body;

      const parsedQtes = JSON.parse(qtes);
      console.log(parsedQtes);
      let indexOfInvalidQte = -1;

      for (let i = 0; i < parsedQtes.length; i++) {
        const qte = parsedQtes[i];
        if (qte.qte < 1) {
          indexOfInvalidQte = i;
          break;
        }
      }

      if (indexOfInvalidQte !== -1) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: `Please choose a valid quantity fot item ${
            indexOfInvalidQte + 1
          }`,
        });
      }

      for (const qte of parsedQtes) {
        const articleInStock = await Stock.findOne({
          article: qte.article,
        }).populate("article");

        if (!articleInStock) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ message: "Article not in stock" });
        }

        if (qte.qte > articleInStock.stock) {
          return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: `Requested quantity exceeds available stock for the article : ${articleInStock?.article?.name}`,
          });
        }

        articleInStock.stock -= qte.qte;
        await articleInStock.save();
      }

      const parsedArticles = JSON.parse(articles);

      if (!parsedArticles || parsedArticles.length === 0) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Cannot create a Sale with no Articles" });
      }

      let totalWeight = 0;

      const selectedArticles = [];

      for (const articleId of parsedArticles) {
        const article = await Article.findOne({ _id: articleId });

        if (!article) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ message: `Article with ID ${articleId} not found` });
        }

        selectedArticles.push(article._id);
        totalWeight += article.weight;
      }

      const client = await Client.findOne({ _id: clientId });

      if (!client) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: `Client with ID ${clientId} not found` });
      }

      const ref = await GenerateSalesReference();
      // Create the sale object
      const newSale = new Sale({
        ref,
        description,
        articles: selectedArticles,
        client,
        total,
        totalWeight,
        date,
        total,
        notPaid: total,
      });

      // Update the client's purchases array
      client.purchases.push(newSale);

      // Save the client first
      await client.save();

      // Save the sale
      await newSale.save();

      res
        .status(HTTP_STATUS.CREATED)
        .json({ message: "Sale created successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  //update Sale
  static updateSale = async (req, res) => {
    const { saleId } = req.params;
    const { status, date, client, description, articles, paiementData, total } =
      req.body;
    try {
      const sale = await Sale.findById(saleId);
      if (!sale) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Sale not found" });
      }
      const parsedArticles = JSON.parse(articles);
      if (!parsedArticles || parsedArticles.length === 0) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Cannot create a Sale with no Articles" });
      }

      let totalWeight = 0;

      const selectedArticles = [];
      for (const articleId of parsedArticles) {
        const article = await Article.findOne({ _id: articleId });
        if (!article) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ message: `Article with ID ${articleId} not found` });
        }
        selectedArticles.push(article._id);
        totalWeight += article.weight;
      }
      for (const articleId of selectedArticles) {
        await Article.findByIdAndDelete(articleId);
      }

      const totalPaymentAmount = paiementData?.reduce(
        (acc, payment) => acc + Number(payment.amount),
        0
      );

      // Calculate notPaid amount
      const notPaidAmount = Number(total) - Number(totalPaymentAmount);
      const updatedSale = await Sale.findByIdAndUpdate(
        saleId,
        {
          status,
          description,
          date,
          client,
          articles: selectedArticles,
          total,
          totalWeight,
          $set: { payment: paiementData },
          paid: totalPaymentAmount, // Set the paid amount
          notPaid: notPaidAmount, // Set the notPaid amount
        },
        { new: true }
      );

      if (!updatedSale) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Sale not found" });
      }

      return res.status(HTTP_STATUS.OK).json({
        message: "Sale updated successfully",
        Sale: updatedSale,
      });
    } catch (error) {
      console.error(error);
      console.error("error");
    }
  };

  // delete sale
  static deleteSale = async (req, res) => {
    const { saleId } = req.params;
    try {
      const deletedSale = await Sale.findByIdAndDelete(saleId);
      if (!deletedSale) {
        return res.status(404).json({ message: "Sale not found" });
      }

      // Sale successfully deleted
      return res.status(200).json({ message: "Sale deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  static verifyQte = async (req, res) => {
    const { qtes } = req.body; 

    try {
      // Create an array to store the results
      const status = [];

      for (const q of qtes) {
        console.log(q.article);
        const articleInStock = await Stock.findOne({
          article: q.article,
        }).populate("article");

        if (!articleInStock) {
          // Push the validation status to the results array
          status.push({
            article: q.article,
            qteStatus: "invalid",
          });
        } else if (q.qte > articleInStock.stock || q.qte <= 0) {
          // Push the validation status to the results array
          status.push({
            article: q.article,
            qteStatus: "invalid",
          });
        } else {
          // Push the validation status to the results array
          status.push({
            article: q.article,
            qteStatus: "valid",
          });
        }
      }

      // Return the results array
      return res.status(HTTP_STATUS.OK).json({ status });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  //----- Payments ----------------------------------------------------------
  //add Payments for sales
  static addPayment = async (req, res) => {
    const { method, amount, date } = req.body;
    const { saleId } = req.params;

    try {
      if (!method || !amount || !date) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: "Please fill all the fields",
        });
      }

      const sale = await Sale.findById(saleId);
      if (!sale) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Sale not found" });
      }

      if (amount <= sale.notPaid) {
        // Update the payment array of the sale
        sale.payment.push({ method, amount, date });

        // calling the updatePayments method in Sale model to save() and to update payments
        sale.updatePayments();
      } else {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Payment amount exceeds the outstanding balance." });
      }

      res
        .status(HTTP_STATUS.OK)
        .json({ message: "Payments added successfully", sale });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  //edit Payment
  static editPayment = async (req, res) => {
    const { method, amount, date } = req.body;
    const { saleId, paymentId } = req.params;

    try {
      if (!method || !amount || !date) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: "Please fill all the fields",
        });
      }

      const sale = await Sale.findById(saleId);
      if (!sale) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Sale not found" });
      }

      // Find the index of the payment in the array
      const paymentIndex = sale.payment.findIndex((payment) =>
        payment._id.equals(paymentId)
      );

      if (paymentIndex !== -1) {
        // Update the payment in the array
        sale.payment[paymentIndex] = {
          ...sale.payment[paymentIndex],
          method,
          amount,
          date,
        };

        // Save the updated document
        await sale.save();

        res
          .status(HTTP_STATUS.OK)
          .json({ message: "Payment updated successfully", sale });
      } else {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Payment not found" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  //delete Payment
  static deletePayment = async (req, res) => {
    const { saleId, paymentId } = req.params;
    try {
      //check if the sale exists
      const sale = await Sale.findOne({ _id: saleId });
      if (!sale) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Sale not found" });
      }

      //get the index of the payment
      const paymentIndex = sale.payment.findIndex((payment) =>
        payment._id.equals(paymentId)
      );

      if (paymentIndex !== -1) {
        // Remove the payment from the array
        sale.payment.splice(paymentIndex, 1);

        // Save the updated document
        await sale.save();

        res
          .status(HTTP_STATUS.OK)
          .json({ message: "Payment deleted successfully", sale });
      } else {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Payment not found" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };
}

module.exports = SalesController;
