const Repair = require("../../models/repairs/Repair");
const Technicien = require("../../models/techniciens/Technicien");
const Article = require("../../models/articles/Article");
const HTTP_STATUS = require("../../utils/HTTP");

class RepairsController {
  //get All Repairs
  static getAllRepairs = async (req, res) => {
    const {
      search,
      technicien,
      date,
      status,
      repairedArticleCount,
      cost,
      startDate,
      endDate,
    } = req.query;
    console.log(req.query);
    const query = {};
    try {
      if (search !== undefined) {
        const trimmedSearch = search.trim();
        const [firstNameSearch, lastNameSearch] = trimmedSearch.split(" ");

        // Search for technicians based on first name and last name
        const technicians = await Technicien.find({
          $or: [
            { firstName: new RegExp(firstNameSearch, "i") },
            { lastName: new RegExp(lastNameSearch, "i") },
          ],
        });

        // Extract technician IDs
        const technicianIds = technicians.map((technician) => technician._id);

        query.technicien = { $in: technicianIds };
      }

      if (technicien != undefined) {
        const selectedTechnicien = await Technicien.findOne({
          _id: technicien,
        });
        if (!technicien) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ message: "Technicien not found" });
        }
        query.technicien = selectedTechnicien._id;
      }

      if (date !== undefined) {
        const parsedDate = new Date(date);
        const nextDay = new Date(parsedDate);
        nextDay.setDate(parsedDate.getDate() + 1);

        query.createdAt = {
          $gte: parsedDate,
          $lt: nextDay,
        };
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

      if (status !== undefined) {
        query.status = status;
      }

      if (cost !== undefined) {
        query.price = cost;
      }

      if (repairedArticleCount !== undefined) {
        query.repairedArticles = { $size: parseInt(repairedArticleCount) };
      }

      const repairs = await Repair.find(query).populate("technicien");
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
      const repair = await Repair.findOne({ _id: repairId }).populate(
        "client technicien repairedArticles.color"
      );
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
    console.log(req.body);
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
    const { repairId } = req.params;
    const { technicien, repairedArticles, client, price, status } = req.body;
    console.log(req.body);
    try {
      if (
        !repairId ||
        !technicien ||
        !repairedArticles ||
        repairedArticles.length < 1 ||
        !client ||
        !price
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

      existingRepair.repairedArticles = repairedArticles;
      existingRepair.technicien = selectedTechnicien._id;
      existingRepair.client = client;
      existingRepair.price = price;
      existingRepair.status = status;

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
