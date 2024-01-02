const bcrypt = require("bcrypt");
const HTTP_STATUS = require("../../utils/HTTP");

const Client = require("../../models/clients/Client");
const Role = require("../../models/roles & permissions/Role");

class ClientController {
  //get all clients
  static getClients = async (req, res) => {
    try {
      const clients = await Client.find();
      if (!clients || clients.length === 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "No clients were found" });
      }
      return res.status(HTTP_STATUS.OK).json(clients);
    } catch (error) {
      console.error(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
  };

  //get one client by Id
  static getClient = async (req, res) => {
    const { clientId } = req.params;
    try {
      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Client not found" });
      }
      return res.status(HTTP_STATUS.OK).json(client);
    } catch (error) {
      console.error(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
  };

  // ADD toggleStatus
  static toggleStatus = async (req, res) => {
    const { clientId } = req.params;
    try {
      const client = await Client.findOne({ _id: clientId });
      if (!client) {
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: "client not found" });
      } else {
        const clientStatusUpdated = await Client.findByIdAndUpdate(
          client._id,
          {
            status: !client.status,
          },
          { new: true }
        );
        return res.status(HTTP_STATUS.OK).json({
          message: "client Status Updated successfully",
          client: clientStatusUpdated,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
  };

  //Add Client
  static addClient = async (req, res) => {
    // Request body data
    const { firstName, lastName, email, phone, password, typeClient } = req.body;
  
    try {
      
      // Missing data check
      if (!firstName || !lastName  || !email || !phone || !password || !typeClient) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Missing required fields" });
      }
  
      // Client already exists check
      const alreadyExist = await Client.findOne({
         email: email 
      });
  
      if (alreadyExist) {
        return res.status(HTTP_STATUS.CONFLICT).json({ message: "Client already exists" });
      }
  
      // Hashing the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new client
      const newClient = new Client({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        typeClient,
        // Additional fields as needed
      });
  
      // Save the new client to the database
      await newClient.save();
  
      return res.status(HTTP_STATUS.CREATED).json({ message: "Client created successfully", client: newClient });
    } catch (error) {
      console.error(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    
  };
  

};

  //Update Client
  static updateClient = async (req, res) => {
  const { clientId } = req.params;
  const { firstName, lastName, email, phone, password, typeClient, address } = req.body;

  try {
    // Check if the client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Client not found" });
    }

    // Update client details
    if (firstName) client.name = firstName;
    if (lastName) client.name = lastName;
    if (email) client.email = email;
    if (phone) client.phone = phone;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      client.password = hashedPassword;
    }
    if (typeClient) client.typeClient = typeClient;
    if (address) client.address = address;

    // Save the updated client to the database
    await client.save();

    return res.status(HTTP_STATUS.OK).json({ message: "Client updated successfully", client: client });
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
  }
};

  //Delete Client 
  static deleteClient = async (req, res) => {
    const { clientId } = req.params;
    try {
      const client = await Client.findOne({ _id: clientId });
      if (!client) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "client not found" });
      }
      await Client.findByIdAndDelete(client._id);
      return res.status(HTTP_STATUS.ok).json({ message: "client deleted successfully" });
    } catch (error) {
      console.error(error)
      // throw error;
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    
    }
  };


}

module.exports = ClientController;
