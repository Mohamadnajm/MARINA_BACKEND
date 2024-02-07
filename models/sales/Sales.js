const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema(
  {
    ref: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Pending",
    },
    description: {
      type: String,
      required: false,
      default: "",
    },
    articles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
        required: true,
      },
    ],
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    totalWeight: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    paid: {
      type: Number,
      required: true,
      default: 0,
    },
    notPaid: {
      type: Number,
      required: true,
      default: 0,
    },
    payment: [
      {
        method: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          default: 0,
        },
        date: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Function to update paid and notPaid fields
salesSchema.methods.updatePayments = async function () {
  // Calculate the sum of amounts in the payment array
  const totalPayments = this.payment.reduce(
    (total, payment) => total + payment.amount,
    0
  );
  // Update the paid and notPaid fields
  this.paid = totalPayments;
  this.notPaid = this.total - totalPayments;
  // Save the updated document
  await this.save();
};

module.exports = mongoose.model("Sale", salesSchema);
