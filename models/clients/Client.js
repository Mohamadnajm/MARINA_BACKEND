const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      // unique: true,
    },
    lastName: {
      type: String,
      required: true,
      // unique: true,
    },
    typeClient: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
    },
    purchases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sale",
        required: true,
      },
    ],
    total: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
