const mongoose = require("mongoose");

const permissionSchema = mongoose.Schema({
  permissionName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

module.exports = mongoose.model("Permission", permissionSchema);
