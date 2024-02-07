const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const supplierSchema = new Schema(
  {
    firstName: {
      type: String,
      lowercase: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    phone: {
      type: String,
      unique: true,
      trim: true,
    },
    address: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
    articles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
        required: true,
      },
    ],
    totalPayment: {
      type: Number,
      required: true,
      default: 0,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
