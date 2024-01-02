const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  hex: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Color", colorSchema);
