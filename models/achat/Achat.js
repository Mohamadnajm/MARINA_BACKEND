const mongoose = require("mongoose");
const AchatSchema = mongoose.Schema(
  {
    ref: {
      type: String,
      required: true,
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },
    countArticle: {
      type: Number,
      required: true,
      default: 0,
      min: 1,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    typeArticle: {
      type: String,
      required: true,
    },
    totalweight: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Achat", AchatSchema);
