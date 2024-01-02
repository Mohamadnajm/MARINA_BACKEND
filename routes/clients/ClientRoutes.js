const express = require("express");
const ClientController = require("../../controllers/clients/ClientController");

const router = express.Router();

// clients routes
router.get("/clients", ClientController.getClients);
router.get("/clients/:clientId", ClientController.getClient);
router.post("/clients", ClientController.addClient);
router.put("/clients/:clientId", ClientController.updateClient);
router.delete("/clients/:clientId", ClientController.deleteClient);
router.put("/clients/status/:clientId", ClientController.toggleStatus);

module.exports = router;
