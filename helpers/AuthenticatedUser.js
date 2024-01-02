require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/users/User");
const HTTP_STATUS = require("../utils/HTTP");
const AuthenticatedUser = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  //   console.log(authHeader);
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  try {
    const token = authHeader.split(" ")[1];

    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

    const decodedUser = decodedPayload.userId;

    const user = await User.findOne({ _id: decodedUser }).populate("role");
    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "Error getting user's authentication data" });
    }
    req.user = user; //returning the existing user
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid token" });
  }
};

module.exports = AuthenticatedUser;
