var jwt = require("jsonwebtoken");
const User = require("../../models/users/User");
const Role = require("../../models/roles & permissions/Role");
const HTTP_STATUS = require("../../utils/HTTP");

const bcrypt = require("bcrypt");

class AuthController {
  //  Register
  static register = async (req, res) => {
    //request body data
    const { userName, firstName, lastName, email, phone, password, role } =
      req.body;
    try {
      //missing data check
      if (
        !userName ||
        !email ||
        !firstName ||
        !lastName ||
        !phone ||
        !password ||
        !role
      ) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Missing required fields" });
      }

      //user already exist check
      const alreadyExist = await User.findOne({
        $or: [{ userName: userName }, { email: email }],
      });
      if (alreadyExist) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .json({ message: "User already exists" });
      }

      //selected role check
      const selectedRole = await Role.findOne({ _id: role });
      if (!selectedRole) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Role not found" });
      }

      //hashing the password
      const hashedPassword = await bcrypt.hash(password, 10);

      //saving the user with the role and the hashedPassword
      const newUser = new User({
        userName,
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        role: selectedRole._id,
      });
      await newUser.save();
      return res
        .status(HTTP_STATUS.CREATED)
        .json({ message: `${selectedRole.roleName} created successfully` });
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error });
    }
  };
  // Login
  static login = async (req, res) => {
    const { identity, password } = req.body;

    if (!identity || !password) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: "Please fill all the fields" });
    }

    const secretKey = process.env.JWT_SECRET;

    try {
      // Check if the user exists by email or username
      const user = await User.findOne({
        status: true,
        $or: [{ email: identity }, { userName: identity }],
      });

      if (!user) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Invalid userName or email" });
      }

      // Compare the password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Incorrect password please try again" });
      }

      // Generate a JWT token
      const token = jwt.sign({ userId: user._id }, secretKey, {
        expiresIn: "4h",
      });

      // Send the token as a cookie in the response
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3600000, // 1 hour in milliseconds
        secure: false,
        sameSite: "Strict",
      });

      res
        .status(HTTP_STATUS.OK)
        .json({ message: "Logged in successfully", token });
    } catch (error) {
      console.error(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };
}
module.exports = AuthController;
