const Technicien = require("../../models/techniciens/Technicien");
const HTTP_STATUS = require("../../utils/HTTP");

class TechnicienController {
  //get All Techniciens
  static getAllTechniciens = async (req, res) => {
    const { fullName, search, phone, date, status, startDate, endDate } =
      req.query;
    const query = {};
    try {
      if (fullName !== undefined) {
        const trimmedSearch = fullName.trim();
        const [firstNameSearch, lastNameSearch] = trimmedSearch.split(" ");

        const nameRegex = new RegExp(firstNameSearch, "i");
        const lastNameRegex = new RegExp(lastNameSearch, "i");

        query.$or = [
          {
            $and: [{ firstName: nameRegex }, { lastName: lastNameRegex }],
          },
          {
            $and: [{ firstName: lastNameRegex }, { lastName: nameRegex }],
          },
        ];
      }

      if (search !== undefined) {
        const trimmedSearch = search.trim();
        const [firstNameSearch, lastNameSearch] = trimmedSearch.split(" ");

        const nameRegex = new RegExp(firstNameSearch, "i");
        const lastNameRegex = new RegExp(lastNameSearch, "i");

        query.$or = [
          {
            $and: [{ firstName: nameRegex }, { lastName: lastNameRegex }],
          },
          {
            $and: [{ firstName: lastNameRegex }, { lastName: nameRegex }],
          },
          { phone: { $regex: new RegExp(trimmedSearch, "i") } },
        ];
      }

      if (phone != undefined) {
        query.phone = { $regex: new RegExp(phone, "i") };
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

      if (status !== undefined) {
        query.status = status;
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
      const tehniciens = await Technicien.find(query);
      if (!tehniciens) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "No Technicien was found" });
      }

      return res.status(HTTP_STATUS.OK).json({ tehniciens });
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error });
    }
  };

  //get one Technicien
  static getOneTechnicien = async (req, res) => {
    const { technicienId } = req.params;
    try {
      const technicien = await Technicien.findOne({ _id: technicienId });
      if (!technicien) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Technicien not found" });
      }

      return res.status(HTTP_STATUS.OK).json({ technicien });
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error });
    }
  };

  //create a Technicien
  static createTechnicien = async (req, res) => {
    const { firstName, lastName, phone } = req.body;
    try {
      if (!firstName || !lastName || !phone) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Please fill all the fields" });
      }

      const newTechnicien = new Technicien({
        firstName,
        lastName,
        phone,
      });

      await newTechnicien.save();

      return res.status(HTTP_STATUS.CREATED).json({
        message: "New Technicien created successfully",
        newTechnicien,
      });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  //update a Technicien
  static updateTechnicien = async (req, res) => {
    const { technicienId } = req.params;
    const { firstName, lastName, phone } = req.body;
    try {
      const technicien = await Technicien.findOne({ _id: technicienId });
      if (!technicien) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Technicien not found" });
      }

      if (firstName) technicien.firstName = firstName;
      if (lastName) technicien.lastName = lastName;
      if (phone) technicien.phone = phone;

      await technicien.save();

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "Technicien updated successfully", technicien });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  //delete Technicien
  static deleteTechnicien = async (req, res) => {
    const { technicienId } = req.params;
    try {
      const technicien = await Technicien.findOne({ _id: technicienId });
      if (!technicien) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Technicien not found" });
      }
      await Technicien.findByIdAndDelete(technicien.id);

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "Technicien deleted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };
}

module.exports = TechnicienController;
