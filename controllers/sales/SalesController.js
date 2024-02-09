const Article = require("../../models/articles/Article");
const Client = require("../../models/clients/Client");
const Sale = require("../../models/sales/Sales");
const Stock = require("../../models/stock/Stock");

const HTTP_STATUS = require("../../utils/HTTP");

const GenerateSalesReference = require("./SalesRefsGenerator");

class SalesController {
  // Get All Sales
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

      const sales = await Sale.find(query).sort({createdAt : -1})
        .populate({
          path: "articles",
          populate: {
            path: "article", // Populate the 'article' field inside the 'articles' array
            model: "Article",
            populate: {
              path: "color", // Populate the 'color' field inside the 'article' object
              model: "Color",
            },
          },
        })
        .populate("client");

      if (!sales) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "No sales were found" });
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
      const sale = await Sale.findOne({ _id: saleId })
        .populate({
          path: "articles",
          populate: {
            path: "article", // Populate the 'article' field inside the 'articles' array
            model: "Article",
            populate: {
              path: "color", // Populate the 'color' field inside the 'article' object
              model: "Color",
            },
          },
        })
        .populate("client");
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
      const { description, clientId, date, total, qtes } = req.body;

      const parsedQtes = JSON.parse(qtes);

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
          message: `Please choose a valid quantity for item ${
            indexOfInvalidQte + 1
          }`,
        });
      }

      const selectedArticles = [];

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
            message: `Requested quantity exceeds available stock for the article: ${articleInStock?.article?.name}`,
          });
        }

        selectedArticles.push({ article: qte.article, quantity: qte.qte });
      }

      if (!selectedArticles || selectedArticles.length === 0) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Cannot create a Sale with no Articles" });
      }

      let totalWeight = 0;

      for (const articleId of selectedArticles) {
        const article = await Article.findOne({ _id: articleId.article });

        if (!article) {
          return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: `Article with ID ${articleId.article} not found`,
          });
        }

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
    const { status, date, client, description, total, qtes } = req.body;

    const qtesArray = JSON.parse(qtes);

    try {
      const sale = await Sale.findById(saleId);
      if (!sale) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Sale not found" });
      }

      let totalWeight = 0;
      const articlesToUpdate = [];

      // Iterate through qtes array to update articles and calculate totalWeight
      for (const { article, qte } of qtesArray) {
        if (qte <= 0) {
          return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ message: "Please enter a valid quantity" });
        }
        const existingArticle = await Article.findById(article);
        if (!existingArticle) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ message: `Article with ID ${article} not found` });
        }

        articlesToUpdate.push({ article, quantity: qte });
        totalWeight += existingArticle.weight;
      }

      const updatedSale = await Sale.findByIdAndUpdate(
        saleId,
        {
          status,
          description,
          date,
          client,
          articles: articlesToUpdate, // Update articles array with new data
          total,
          totalWeight,
        },
        { new: true }
      );

      if (qtes && status === "Done") {
        for (const qte of qtesArray) {
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
              message: `Requested quantity exceeds available stock for the article: ${articleInStock?.article?.name}`,
            });
          }

          articleInStock.stock -= qte.qte;
          await articleInStock.save();
        }
      }

      updatedSale.updatePayments();

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
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
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
    const { method, amount, description, date } = req.body;
    const { saleId } = req.params;

    try {
      if (!method || !amount || !date || !description) {
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
        sale.payment.push({ method, amount, description, date });

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
    const { method, amount, description, date } = req.body;
    const { saleId, paymentId } = req.params;

    try {
      if (!method || !amount || !date || !description) {
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
          description,
          date,
        };

        // calling the updatePayments method in Sale model to save() and to update payments
        sale.updatePayments();

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

        // calling the updatePayments method in Sale model to save() and to update payments
        sale.updatePayments();

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
