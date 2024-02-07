const Achat = require("../../models/achat/Achat");
const Supplier = require("../../models/suppliers/Supplier");
const HTTP_STATUS = require("../../utils/HTTP");

class SupplierController {
  // Get Suppliers
  static getSupplier = async (req, res) => {
    const {
      fullName,
      search,
      phone,
      date,
      article,
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
      const suppliers = await Supplier.find(query)
        .sort({ createdAt: -1 })
        .populate("articles");
      if (!suppliers || suppliers.length === 0) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "No suppliers were found" });
      }
      return res.status(HTTP_STATUS.OK).json(suppliers);
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // Get One Supplier
  static getOneSupplier = async (req, res) => {
    const { id } = req.params;
    try {
      const supplier = await Supplier.findOne({ _id: id });
      if (!supplier) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Supplier not found" });
      }
      const SelectedSupplierAchats = await Achat.find({
        supplier: id,
      }).populate("article");
      
      let totalPurchases = 0;
      SelectedSupplierAchats.forEach((achat) => {
        totalPurchases += achat.total || 0;
      });
      supplier.totalPayment = totalPurchases;
      await supplier.save();
      return res
        .status(HTTP_STATUS.OK)
        .json({ supplier: supplier, SelectedSupplierAchats });
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error });
    }
  };

  // static getAchatPerSupplier = async (req, res) => {
  //   const { id } = req.params;
  //   try {
  //     const supplier = Supplier.find(id);
  //     if (!supplier) {
  //       return res
  //         .status(HTTP_STATUS.NOT_FOUND)
  //         .json({ message: "No supplier was found" });
  //     }
  //     const SelectedSupplierAchats = Achat.find({ supplier: id });
  //     console.log(SelectedSupplierAchats);
  //     return res.status(HTTP_STATUS.OK).json(SelectedSupplierAchats);
  //   } catch (error) {
  //     console.error(error);
  //     res
  //       .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  //       .json({ message: "Internal Server Error" });
  //   }
  // };

  // Add Supplier
  static createSupplier = async (req, res) => {
    const { firstName, lastName, email, phone, address, status } = req.body;
    try {
      const alreadyExist = await Supplier.findOne({
        $or: [{ phone: phone }, { email: email }],
      });
      if (alreadyExist) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .json({ message: "Supplier already exists" });
      } else {
        const newSupplier = new Supplier({
          firstName,
          lastName,
          email,
          phone,
          address,
          status,
        });
        await newSupplier.save();
        res.status(HTTP_STATUS.CREATED).json({
          message: "New supplier created successfully",
          supplier: newSupplier,
        });
      }
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // Delete Supplier
  static deleteSupplier = async (req, res) => {
    const supplierId = req.params.id;

    try {
      const supplier = await Supplier.findOne({ _id: supplierId });
      if (!supplier) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Supplier not found" });
      }
      await Supplier.findByIdAndDelete(supplierId);

      res
        .status(HTTP_STATUS.OK)
        .json({ message: "Supplier deleted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  //       // Validate client
  // const article = await Article.findOne({ _id: articleId });
  //   if (!article) {
  //     return res
  //       .status(HTTP_STATUS.NOT_FOUND)
  //       .json({ message: `Article with ID ${articleId} not found` });
  //   }

  //   const ref = await GenerateSalesReference();

  // Update Supplier
  static updateSupplier = async (req, res) => {
    const supplierId = req.params.id; // Assuming the supplier ID is passed as a route parameter
    const updateData = req.body; // Assuming the updated data is sent in the request body

    try {
      if (updateData) {
        const supplier = await Supplier.findOne({ _id: supplierId });
        if (!supplier) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ message: "Supplier not found" });
        }

        // Update the supplier with the new data
        await Supplier.findByIdAndUpdate(supplierId, updateData);

        res
          .status(HTTP_STATUS.OK)
          .json({ message: "Supplier updated successfully" });
      } else {
        res
          .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .json({ message: "Missing Fields" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // Change Status
  static toggleStatus = async (req, res) => {
    const supplierId = req.params.id;
    try {
      const supplier = await Supplier.findOne({ _id: supplierId });
      if (!supplier) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Supplier not found" });
      } else {
        const supplierStatusUpdated = await Supplier.findByIdAndUpdate(
          supplier._id,
          {
            status: !supplier.status,
          },
          { new: true }
        );
        return res.status(HTTP_STATUS.OK).json({
          message: "Supplier Status Updated successfully",
          supplier: supplierStatusUpdated,
        });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  };
}

module.exports = SupplierController;
