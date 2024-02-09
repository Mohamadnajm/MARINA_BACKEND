const HTTP_STATUS = require("../../utils/HTTP");
const Role = require("../../models/roles & permissions/Role");
const Permission = require("../../models/roles & permissions/Permission");

class RoleController {
  // Get Roles
  static getRoles = async (req, res) => {
    try {
      const roles = await Role.find();
      if (!roles) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "No Role was Found" });
      }
      return res.status(HTTP_STATUS.OK).json(roles);
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };
  // show role
  static showRole = async (req, res) => {
    const { roleId } = req.params;
    try {
      if (!roleId) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Please provide a valid name" });
      }
      const selectedRole = await Role.findOne({ _id: roleId });
      res.status(HTTP_STATUS.OK).json({ selectedRole: selectedRole || {} });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };
  //Add role
  static addRoles = async (req, res) => {
    const { roleName, permissions } = req.body;
    try {
      // Check if roleName is provided
      if (!roleName) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Please provide a valid name" });
      }

      // Check if permissions array is provided and not empty
      if (
        !permissions ||
        !Array.isArray(permissions) ||
        permissions.length === 0
      ) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Please provide valid permissions" });
      }

      // Check if roleName already exists
      const existingRole = await Role.findOne({ roleName });
      if (existingRole) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .json({ message: "Role with the provided name already exists" });
      }

      // Check if each permission ID provided in the permissions array is valid
      const invalidPermissions = await Permission.find({
        _id: { $in: permissions },
      });
      if (invalidPermissions.length !== permissions.length) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "One or more permissions are invalid" });
      }

      // If all checks pass, create a new role
      const newRole = new Role({
        roleName: roleName,
        permissions,
      });
      await newRole.save();

      res
        .status(HTTP_STATUS.CREATED)
        .json({ message: "New Role created successfully", newRole });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // Update Role
  static updateRole = async (req, res) => {
    const { roleId } = req.params;
    const { roleName, permissions } = req.body;
    try {
      if (!roleName || !permissions || !Array.isArray(permissions)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message:
            "Please provide a role name and a valid array of permissions",
        });
      }

      // Check if all permissions provided exist
      const allPermissionsExist = await Promise.all(
        permissions.map(async (permissionId) => {
          const permission = await Permission.findById(permissionId);
          return permission !== null;
        })
      );

      // If any permission doesn't exist, return a bad request response
      if (!allPermissionsExist.every(Boolean)) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "One or more permissions do not exist" });
      }

      const updatedRole = await Role.findByIdAndUpdate(
        roleId,
        {
          roleName,
          permissions,
        },
        { new: true }
      );
      if (!updatedRole) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Role not found" });
      }
      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "Role updated successfully", Role: updatedRole });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // delete role
  static deleteRole = async (req, res) => {
    const { roleId } = req.params;
    try {
      const deletedRole = await Role.findByIdAndDelete(roleId);
      if (!deletedRole) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Role not found" });
      }
      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "Role deleted successfully " });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };
}

module.exports = RoleController;
