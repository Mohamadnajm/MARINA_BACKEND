const Permission = require("../../models/roles & permissions/Permission");
const HTTP_STATUS = require("../../utils/HTTP");

class PermissionController {
  static getAllPermissions = async (req, res) => {
    try {
      const permissions = await Permission.find();
      if (!permissions || permissions.length === 0) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "No permission were found" });
      }

      return res.status(HTTP_STATUS.OK).json({ permissions });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  static getOnePermission = async (req, res) => {
    const { permissionId } = req.params;
    try {
      const permission = await Permission.findOne({ _id: permissionId });
      if (!permission) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Permission not found" });
      }

      return res.status(HTTP_STATUS.OK).json({ permission });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  static createPermission = async (req, res) => {
    const { permissionName } = req.body;
    try {
      // Check if permissionName is provided
      if (!permissionName) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Please provide a permission name" });
      }

      // Check if permission already exists
      const existingPermission = await Permission.findOne({ permissionName });
      if (existingPermission) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .json({ message: "Permission already exists" });
      }

      // Create new permission
      const newPermission = new Permission({ permissionName });
      await newPermission.save();

      // Return success response
      return res.status(HTTP_STATUS.CREATED).json({
        message: "New permission created successfully",
        newPermission,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  static updatePermission = async (req, res) => {
    const { permissionName } = req.body;
    const { permissionId } = req.params;
    try {
      if (!permissionName) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Please provide a permission name" });
      }
      const permission = await Permission.findById(permissionId);
      if (!permission) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Permission not found" });
      }

      const existingPermission = await Permission.findOne({ permissionName });
      if (
        existingPermission &&
        existingPermission._id.toString() !== permissionId
      ) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .json({ message: "Permission name already exists" });
      }

      permission.permissionName = permissionName;
      await permission.save();

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "Permission updated successfully", permission });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };

  static deletePermission = async (req, res) => {
    const { permissionId } = req.params;
    try {
      const permission = await Permission.findById(permissionId);
      if (!permission) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Permission not found" });
      }

      await Permission.findByIdAndDelete(permissionId);

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "Permission deleted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  };
}
module.exports = PermissionController;
