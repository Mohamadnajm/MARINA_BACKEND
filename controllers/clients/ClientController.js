const bcrypt = require("bcrypt");
const HTTP_STATUS = require("../../utils/HTTP");

const Client = require("../../models/clients/Client");
const Role = require("../../models/roles & permissions/Role");
const ExcelJS = require("exceljs");

class ClientController {
  //get all clients
  static getClients = async (req, res) => {
    const {
      fullName,
      search,
      phone,
      date,
      sells,
      total,
      status,
      startDate,
      endDate,
    } = req.query;
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

      if (sells !== undefined) {
        query.purchases = { $size: parseInt(sells) };
      }

      const clients = await Client.find(query)
        .populate("purchases")
        .sort({ createdAt: -1 });
      if (!clients || clients.length === 0) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "No clients were found" });
      }
      return res.status(HTTP_STATUS.OK).json(clients);
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
      /*
      
      */
    }
  };

  //get one client by Id
  static getClient = async (req, res) => {
    const { clientId } = req.params;
    try {
      const client = await Client.findOne({ _id: clientId }).populate({
        path: "purchases",
        populate: {
          path: "articles",
          model: "Article", // Make sure this matches the model name for the Article
        },
      });

      if (!client) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Client not found" });
      }

      return res.status(HTTP_STATUS.OK).json(client);
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  };

  // ADD toggleStatus
  static toggleStatus = async (req, res) => {
    const { clientId } = req.params;
    try {
      const client = await Client.findOne({ _id: clientId });
      if (!client) {
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: "client not found" });
      } else {
        const clientStatusUpdated = await Client.findByIdAndUpdate(
          client._id,
          {
            status: !client.status,
          },
          { new: true }
        );
        return res.status(HTTP_STATUS.OK).json({
          message: "client Status Updated successfully",
          client: clientStatusUpdated,
        });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  };

  //Add Client
  static addClient = async (req, res) => {
    // Request body data
    const { firstName, lastName, email, phone, typeClient, address, status } =
      req.body;

    try {
      // Missing data check
      if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !typeClient ||
        !address
      ) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Missing required fields" });
      }

      // Client already exists check
      const alreadyExist = await Client.findOne({
        email: email,
      });

      if (alreadyExist) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .json({ message: "Client already exists" });
      }

      // Create a new client
      const newClient = new Client({
        firstName,
        lastName,
        email,
        phone,
        typeClient,
        address,
        status,
      });

      // Save the new client to the database
      await newClient.save();

      return res
        .status(HTTP_STATUS.CREATED)
        .json({ message: "Client created successfully", client: newClient });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  //Update Client
  static updateClient = async (req, res) => {
    const { clientId } = req.params;
    const { firstName, lastName, email, phone, password, typeClient, address } =
      req.body;

    try {
      // Check if the client exists
      const client = await Client.findById(clientId);
      if (!client) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Client not found" });
      }

      // Update client details
      if (firstName) client.name = firstName;
      if (lastName) client.name = lastName;
      if (email) client.email = email;
      if (phone) client.phone = phone;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        client.password = hashedPassword;
      }
      if (typeClient) client.typeClient = typeClient;
      if (address) client.address = address;

      // Save the updated client to the database
      await client.save();

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "Client updated successfully", client: client });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  //Delete Client
  static deleteClient = async (req, res) => {
    const { clientId } = req.params;
    try {
      const client = await Client.findOne({ _id: clientId });
      if (!client) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "client not found" });
      }
      await Client.findByIdAndDelete(client._id);
      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "client deleted successfully" });
    } catch (error) {
      console.error(error);
      // throw error;
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };
  //************************************************************************************************* */

  // static export = async (req, res) => {
  //   const clientTab = req.query.tab;
  //   try {
  //     let workbook = new ExcelJS.Workbook();
  //     const sheet = workbook.addWorksheet("clients");
  //     sheet.columns = [
  //       { header: "Nom", key: "name", width: 25 },
  //       { header: "Téléphone", key: "phone", width: 50 },
  //       { header: "Date de création", key: "date", width: 30 },
  //       { header: "Achats", key: "achats", width: 20 },
  //       { header: "Total", key: "total", width: 20 }
  //     ];

  //     if (clientTab) {
  //       this.clientToExport.forEach((client) => {
  //         //   : "";
  //         const clientName = client.name
  //           ? `${client.name.profile.firstName} ${client.name.profile.lastName}`
  //           : "";
  //         // console.log(clients);
  //         sheet.addRow({
  //           name: clientName,
  //           phone: client.phone,
  //           date: client.date,
  //           achats: client.Achats,
  //           total: client.total
  //         });
  //       });
  //     } else {
  //       const client = await Client.find({ deletedAt: null })
  //         .sort({ createdAt: -1 })
  //         .populate({
  //           path: "clientDepart clientArriv",
  //           populate: {
  //             path: "profile",
  //             model: "Profile",
  //           },
  //         })
  //         .populate({
  //           path: "name",
  //           populate: {
  //             path: "profile",
  //             model: "Profile",
  //           },
  //         })
  //         .populate("deviseDepart deviseArriv");
  //       client.forEach((client) => {
  //         const clientName = client.name
  //           ? `${client.name.profile.firstName} ${client.name.profile.lastName}`
  //           : "";
  //         // console.log(clients);
  //         sheet.addRow({
  //           name: clientName,
  //           phone: client.phone,
  //           date: client.date,
  //           achats: client.Achats,
  //           total: client.total
  //           //,
  //         });
  //       });
  //     }

  //     res.setHeader(
  //       "Content-Type",
  //       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  //     );
  //     res.setHeader(
  //       "Content-Disposition",
  //       "attachment; filename=Clients.xlsx" // Corrected filename
  //     );

  //     await workbook.xlsx.write(res);
  //     res.end();
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).json({ error: "Internal Server Error" });
  //   }
  // };
  static exportClients = async (req, res) => {
    try {
      const clients = await Client.find();
      // console.log(clients);

      let workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("clients");
      sheet.columns = [
        { header: "Nom", key: "name", width: 25 },
        { header: "Téléphone", key: "phone", width: 50 },
        { header: "Date de création", key: "date", width: 30 },
        { header: "Achats", key: "achats", width: 30 },
        { header: "Total", key: "total", width: 30 },
        // Add more columns as needed
      ];

      clients.forEach((client) => {
        const clientName = `${client?.firstName} ${client?.lastName}`
        sheet.addRow({
          name: clientName,
          phone: client.phone,
          date: client.createdAt,
          achats: client.purchases.length,
          total: client.total,
        });
        console.log(client.purchases)
      });
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=Clients.xlsx");

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

module.exports = ClientController;
