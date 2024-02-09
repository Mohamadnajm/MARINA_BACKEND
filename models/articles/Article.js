const mongoose = require("mongoose");

const articleSchema = mongoose.Schema(
  {
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      default: 0,
    },
    img: {
      filename: String,
      originalname: String,
      fileType: String,
    },
    color: {
      type: mongoose.Types.ObjectId,
      ref: "Color",
      required: true,
    },
    typeArticle: {
      type: String,
      required: true,
    },
    catalog: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Catalog",
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier", // Make sure this matches the name used when defining the Supplier model
      required: true,
    },
    sellPrice: {
      type: Number,
      required: true,
      min: 1,
    },
    buyPrice: {
      type: Number,
      required: true,
      min: 1,
    },
    barCode: {
      type: String,
      trim: true,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);
