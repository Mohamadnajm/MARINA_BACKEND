const express = require("express");
const UserController = require("../../controllers/users/UserController");

const router = express.Router();

// Users routes
router.get("/users", UserController.getUsers);
router.get("/users/:userId", UserController.getUser);
router.put("/users/:userId", UserController.updateUser);
router.delete("/users/:userId", UserController.deleteUser);
router.put("/status/:userId", UserController.toggleStatus);

module.exports = router;
