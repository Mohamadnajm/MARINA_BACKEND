const mongoose = require("mongoose");
const catalogSchema = mongoose.Schema(
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
    img: {
      type: String,
      default: null,
    },
    articles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Catalog", catalogSchema);
