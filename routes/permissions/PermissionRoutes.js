const express = require("express");
const router = express.Router();

const PermissionController = require("../../controllers/permissions/PermissionController");

router.get("/permissions", PermissionController.getAllPermissions);
router.get("/permissions/:permissionId", PermissionController.getOnePermission);
router.post("/permissions", PermissionController.createPermission);
router.put("/permissions/:permissionId", PermissionController.updatePermission);
router.delete("/permissions/:permissionId", PermissionController.deletePermission);

module.exports = router 