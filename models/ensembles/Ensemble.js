const mongoose = require("mongoose");

const ensemblesSchema = new mongoose.Schema(
  {
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    articles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
        required: true,
      },
    ],
    img: {
      filename: String,
      originalname: String,
      fileType: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ensemble", ensemblesSchema);
