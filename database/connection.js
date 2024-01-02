const mongoose = require("mongoose");

const ConnectDB = async (DB_URL) => {
  try {
    const DB_OPTIONS = {
      dbName: "MarinaJewelry",
    };
    await mongoose.connect(DB_URL, DB_OPTIONS);
    console.log("Connected Successfully..");
  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
};
module.exports = ConnectDB;
