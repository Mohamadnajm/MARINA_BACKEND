const HTTP_STATUS = require("../../utils/HTTP");
const Role = require("../../models/roles & permissions/Role");

class RoleController {
  static getRoles = async (req, res) => {
    try {
      const roles = await Role.find();
      if (!roles) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "No Role was Found" });
      }
      return res.status(HTTP_STATUS.OK).json( roles );
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

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

  static addRoles = async (req, res) => {
    const { name, permission } = req.body;
    console.log(req.body);
    try {
      if (!name) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Please provide a valid name" });
      }
      const newRole = new Role({
        roleName: name,
        permission,
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

  static updateRole = async (req, res) => {
    const { roleId } = req.params;
    const { name, permission } = req.body;
    console.log(name);
    try {
      if (!name) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Please fill all the fields" });
      }

      const updatedRole = await Role.findByIdAndUpdate(
        roleId,
        { roleName: name, permission },
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
