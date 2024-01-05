const Catalog = require("../../models/catalogs/Catalog");

const HTTP_STATUS = require("../../utils/HTTP");

class CatalogController {
  
  // Get All Catalogs
  static getCatalogs = async (req, res) => {
    const { search, nombreArticles } = req.query;
    const query = {};
  
    try {
      if (search !=undefined) {
        query.name = { $regex: new RegExp(search, "i") };
      }
  
      let catalogs = await Catalog.find(query).sort({createdAt : -1});
  
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
  
      if (nombreArticles!=undefined) {
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

      const newCatalog = new Catalog({ status, name, description });
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
    const { name, description , status } = req.body;

    try {
      // Use findByIdAndUpdate to update the existing Catalog
      const updatedCatalog = await Catalog.findByIdAndUpdate(
        catalogId,
        {
          name,
          description,
          status
        },
        { new: true }
      );

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
      console.log("hhhhhhhhhhhhhhhh", catalog);
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
