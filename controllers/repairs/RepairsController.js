const Repair = require("../../models/repairs/Repair");
const Technicien = require("../../models/techniciens/Technicien");
const Article = require("../../models/articles/Article");
const HTTP_STATUS = require("../../utils/HTTP");

class RepairsController {
  //get All Repairs
  static getAllRepairs = async (req, res) => {
    try {
      const repairs = await Repair.find().populate("technicien");
      if (!repairs) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "No repair were found" });
      }

      return res.status(HTTP_STATUS.OK).json({ repairs });
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error });
    }
  };

  //get one Repair
  static getOneRepair = async (req, res) => {
    const { repairId } = req.params;
    try {
      const repair = await Repair.findOne({ _id: repairId }).populate("client");
      if (!repair) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Repair not found" });
      }

      return res.status(HTTP_STATUS.OK).json({ repair });
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error });
    }
  };

  //create a Repair
  static createRepair = async (req, res) => {
    const { technicien, client, repairedArticles, totalCost } = req.body;
    let VerifiedArticles = [];
    let price = 0;

    try {
      if (
        !repairedArticles ||
        repairedArticles.length === 0 ||
        !technicien ||
        !client
      ) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Please fill all the fields" });
      }

      const seletedTechnicien = await Technicien.findOne({ _id: technicien });
      if (!seletedTechnicien) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Technicien not found" });
      }

      if (repairedArticles && repairedArticles.length > 0) {
        const newRepair = new Repair({
          technicien: seletedTechnicien._id,
          client,
          repairedArticles,
          price: totalCost,
        });

        await newRepair.save();
      }

      return res
        .status(HTTP_STATUS.CREATED)
        .json({ message: "New repair created successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  //update a Repair
  static updateRepair = async (req, res) => {
    const { repairId, technicien, articles, phone } = req.body;

    try {
      if (
        !repairId ||
        !technicien ||
        !articles ||
        articles.length === 0 ||
        !phone
      ) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Please provide valid data for update" });
      }

      const existingRepair = await Repair.findOne({ _id: repairId });
      if (!existingRepair) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Repair not found" });
      }

      const selectedTechnicien = await Technicien.findOne({ _id: technicien });
      if (!selectedTechnicien) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Technicien not found" });
      }

      let VerifiedArticles = [];
      let price = 0;

      for (const articleId of articles) {
        const article = await Article.findOne({ _id: articleId });
        if (article) {
          price += article.buyPrice;
          VerifiedArticles.push(article._id);
        }
      }

      // Update the existing repair with new data
      existingRepair.articles = VerifiedArticles;
      existingRepair.technicien = selectedTechnicien._id;
      existingRepair.phone = phone;

      // Save the updated repair
      await existingRepair.save();

      return res.status(HTTP_STATUS.OK).json({
        message: "Repair updated successfully",
        updatedRepair: existingRepair,
      });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  //delete Repair
  static deleteRepair = async (req, res) => {
    const { repairId } = req.params;

    try {
      const repair = await Repair.findOne({ _id: repairId });
      if (!repair) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Repair not found" });
      }
      await Repair.findByIdAndDelete(repairId);

      res
        .status(HTTP_STATUS.OK)
        .json({ message: "Repair deleted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };
}
module.exports = RepairsController;
