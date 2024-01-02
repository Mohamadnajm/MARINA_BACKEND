const Supplier = require("../../models/suppliers/Supplier");
const HTTP_STATUS = require("../../utils/HTTP");
class SupplierController {
  
  // Get Supplier
  static getSupplier = async (req, res) => {
    try {
      const suppliers = await Supplier.find();
      if (!suppliers || suppliers.length === 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "No suppliers were found" });
      }
      return res.status(HTTP_STATUS.OK).json({ suppliers });
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });

    }
  };

  // Add Supplier
  static createSupplier = async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      status,
    } = req.body;
    try {
      const alreadyExist = await Supplier.findOne({
        $or: [{ phone: phone }, { email: email }],
      });
      if (alreadyExist) {
        return res.status(HTTP_STATUS.CONFLICT).json({ message: "Supplier already exists" });
      } else {

        const newSupplier = new Supplier({
          firstName,
          lastName,
          email,
          phone,
          address,
          status
        });
        await newSupplier.save();
        res.status(HTTP_STATUS.CREATED).json({ message: 'New supplier created successfully', supplier : newSupplier });
      }
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  };

  // Delete Supplier
  static deleteSupplier = async (req, res) => {
    const supplierId = req.params.id;

    try {
      const supplier = await Supplier.findOne({ _id: supplierId });
      if (!supplier) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Supplier not found' });
      }
      await Supplier.findByIdAndDelete(supplierId);

      res.status(HTTP_STATUS.OK).json({ message: 'Supplier deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  };

  // Update Supplier
  static updateSupplier = async (req, res) => {
    const supplierId = req.params.id; // Assuming the supplier ID is passed as a route parameter
    const updateData = req.body; // Assuming the updated data is sent in the request body

    try {
      const supplier = await Supplier.findOne({ _id: supplierId });
      if (!supplier) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Supplier not found" });
      }

      // Update the supplier with the new data
      await Supplier.findByIdAndUpdate(supplierId, updateData);

      res.status(HTTP_STATUS.OK).json({ message: "Supplier updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  };

  // Change Status
  static toggleStatus = async (req, res) => {
    const  supplierId  = req.params.id;
    try {
      const supplier = await Supplier.findOne({ _id: supplierId });
      if (!supplier) {
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Supplier not found" });
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
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
  };
}

module.exports = SupplierController;
