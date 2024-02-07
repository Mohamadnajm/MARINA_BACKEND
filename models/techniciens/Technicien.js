const mongoose = require("mongoose");

const technicienSchema = new mongoose.Schema(
  {
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Technicien", technicienSchema)