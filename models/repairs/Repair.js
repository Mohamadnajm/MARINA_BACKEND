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
    repairedArticles: [
      {
        color: {
          type: mongoose.Types.ObjectId,
          ref: "Color",
          required: true,
        },
        typeArticle: {
          type: String,
          required: true,
        },
        weight: {
          type: Number,
          required: true,
          default: 0,
        },
        cost: {
          type: Number,
          required: true,
          default: 0,
        },
        barCode: {
          type: Number,
          required: true,
        },
      },
    ],
    price: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Repair", repairSchema);
