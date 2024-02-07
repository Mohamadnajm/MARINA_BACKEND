const mongoose = require("mongoose");

const EnsembleCategorySchema = new mongoose.Schema(
  {
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    ensembles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ensemble",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("EnsembleCategory", EnsembleCategorySchema);
