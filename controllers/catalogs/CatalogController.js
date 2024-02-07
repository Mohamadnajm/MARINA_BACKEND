const Catalog = require("../../models/catalogs/Catalog");
const fs = require("fs");
const HTTP_STATUS = require("../../utils/HTTP");

class CatalogController {
  // Get All Catalogs
  static getCatalogs = async (req, res) => {
    const { FullName, search, nombreArticles, startDate, endDate } = req.query;

    const query = {};
    try {
      if (FullName != undefined) {
        query.name = { $regex: new RegExp(FullName, "i") };
      }

      if (search != undefined) {
        query.name = { $regex: new RegExp(search, "i") };
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

      let catalogs = await Catalog.find(query).sort({ createdAt: -1 });

      if (!catalogs || catalogs.length === 0) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "No catalogs were found" });
      }

      catalogs = await Promise.all(
        catalogs.map(async (catalog) => {
          const numberArticles = catalog.articles.length;
          return { ...catalog.toObject(), numberArticles };
        })
      );

      if (nombreArticles != undefined) {
        const filteredCatalogs = catalogs.filter(
          (catalog) => catalog.numberArticles === parseInt(nombreArticles)
        );
        catalogs = filteredCatalogs;
      }

      res.status(HTTP_STATUS.OK).json({ catalogs });
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
      });
    }
  };

  // Get One Catalog
  static getCatalog = async (req, res) => {
    const { catalogId } = req.params;
    try {
      const catalog = await Catalog.findOne({ _id: catalogId });

      if (!catalog) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Catalog not found" });
      }

      return res.status(HTTP_STATUS.OK).json({ catalog });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // Add catallog
  static createCatalog = async (req, res) => {
    const { status, name, description, img } = req.body;

    try {
      //check fro missing fields
      if (!name || !description) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Please fill all the fields" });
      }

      const catalogAlreadyExist = await Catalog.findOne({ name: name });
      if (catalogAlreadyExist) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .json({ message: "Catalog already exists" });
      }

      // if (!filename || !originalname || !fileType) {
      //   return res
      //     .status(HTTP_STATUS.BAD_REQUEST)
      //     .json({ message: "Please upload a catalog image " });
      // }

      const newCatalog = new Catalog({
        status,
        name,
        description,
      });
      if (req.file) {
        const { filename, originalname, fileType } = req.file;
        if (!filename || !originalname || !fileType) {
          return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ message: "Invalid image !" });
        }
        newCatalog.img = { filename, originalname, fileType };
      }
      await newCatalog.save();

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "New catalog created successfully" });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // Edit Catalog
  static updateCatalog = async (req, res) => {
    const { catalogId } = req.params;
    const { name, description, status } = req.body;

    try {
      // Use findByIdAndUpdate to update the existing Catalog
      const updatedCatalog = await Catalog.findOne({ _id: catalogId });

      updatedCatalog.name = name;
      updatedCatalog.description = description;
      updatedCatalog.status = status;

      if (req.file) {
        const { filename, originalname, fileType } = req.file;
        if (!filename || !originalname || !fileType) {
          return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ message: "Invalid image !" });
        }
        const catalog = await Catalog.findOne({ _id: catalogId });
        const filePath = `./uploads/catalogs/${catalog.img.filename}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        updatedCatalog.img = { filename, originalname, fileType };
      }
      updatedCatalog.save();
      if (!updatedCatalog) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Catalog not found" });
      }

      return res.status(HTTP_STATUS.OK).json({
        message: "Catalog updated successfully",
        Catalog: updatedCatalog,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // Toggle status
  static toggleStatus = async (req, res) => {
    const { catalogId } = req.params;
    try {
      const catalog = await Catalog.findOne({ _id: catalogId });
      if (!catalog) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Catalog not found" });
      }
      const catalogStatusUpdated = await Catalog.findByIdAndUpdate(
        catalog._id,
        {
          status: !catalog.status,
        },
        { new: true }
      );
      return res.status(HTTP_STATUS.OK).json({
        message: "Catalog Status Updated successfully",
        Catalog: catalogStatusUpdated,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  };

  // delete Catalog
  static deleteCatalog = async (req, res) => {
    const { catalogId } = req.params;

    try {
      const deletedCatalog = await Catalog.findByIdAndDelete(catalogId);

      if (!deletedCatalog) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Catalog not found" });
      }

      const filePath = `./uploads/catalogs/${deletedCatalog.img.filename}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "Catalog deleted successfully " });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };
}

module.exports = CatalogController;
