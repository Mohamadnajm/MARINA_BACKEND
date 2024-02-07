const mongoose = require("mongoose");

const repairSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      default: "Pending",
    },
    technicien: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Technicien",
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Client",
    },
    repairedArticles: {
      type: [mongoose.Schema.Types.Mixed], // Array of Mixed type
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Repair", repairSchema);
