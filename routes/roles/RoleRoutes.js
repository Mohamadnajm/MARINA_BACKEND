const express = require("express");
const RoleController = require("../../controllers/roles/RoleController");

const router = express.Router();

// Role routes
router.get("/roles", RoleController.getRoles);
router.get("/roles/:roleId", RoleController.showRole);
router.post("/roles", RoleController.addRoles);
router.put("/roles/:roleId", RoleController.updateRole);
router.delete("/roles/:roleId", RoleController.deleteRole);

module.exports = router;
