const bcrypt = require("bcrypt");
const HTTP_STATUS = require("../../utils/HTTP");
const User = require("../../models/users/User");
const Role = require("../../models/roles & permissions/Role");

class UserController {
  // Get All Users
  static getUsers = async (req, res) => {
    const { fullName , search , phone , date , role , startDate , endDate} = req.query;
    const query = {};
    try {
      if (fullName !== undefined ) {
        const trimmedSearch = fullName.trim();
        const [firstNameSearch, lastNameSearch] = trimmedSearch.split(' ');
  
        const nameRegex = new RegExp(firstNameSearch, "i");
        const lastNameRegex = new RegExp(lastNameSearch, "i");
  
        query.$or = [
          {
            $and: [
              { firstName: nameRegex },
              { lastName: lastNameRegex }
            ]
          },
          {
            $and: [
              { firstName: lastNameRegex },
              { lastName: nameRegex }
            ]
          }
        ];
      }
 
      if (search !== undefined ) {
        const trimmedSearch = search.trim();
        const [firstNameSearch, lastNameSearch] = trimmedSearch.split(' ');
  
        const nameRegex = new RegExp(firstNameSearch, 'i');
        const lastNameRegex = new RegExp(lastNameSearch, 'i');
  
        query.$or = [
          {
            $and: [
              { firstName: nameRegex },
              { lastName: lastNameRegex },
            ],
          },
          {
            $and: [
              { firstName: lastNameRegex },
              { lastName: nameRegex },
            ],
          },
          { phone: { $regex: new RegExp(trimmedSearch, 'i') } },
          
        ];
      }

      if (phone !=undefined) {
        query.phone = { $regex: new RegExp(phone, "i") };
      }

      if (date !== undefined ) {
        const parsedDate = new Date(date);
        const nextDay = new Date(parsedDate);
        nextDay.setDate(parsedDate.getDate() + 1);
  
        query.createdAt = {
          $gte: parsedDate,
          $lt: nextDay,  
        };
      }

      if (startDate !== undefined && endDate !== undefined) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        parsedEndDate.setDate(parsedEndDate.getDate() + 1); // End date is inclusive
  
        query.createdAt = {
          $gte: parsedStartDate,
          $lt: parsedEndDate
        };
      }

      if (role !== undefined) {
      query.role = role;
    }
    console.log( {fullName , search })
      
  
      const users = await User.find(query).populate("role");
      if (!users) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "No user were found" });
      }
      return res.status(HTTP_STATUS.OK).json(users);
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error });
    }
  };

  // Get One User
  static getUser = async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await User.findOne({ _id: userId }).populate("role");
      if (!user) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "User not found" });
      }
      return res.status(HTTP_STATUS.OK).json({ user: user });
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error });
    }
  };

  // Toggle Status
  static toggleStatus = async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await User.findOne({ _id: userId });
      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: "User not found" });
      } else {
        const userStatusUpdated = await User.findByIdAndUpdate(
          user._id,
          {
            status: !user.status,
          },
          { new: true }
        );
        return res.status(HTTP_STATUS.OK).json({
          message: "User Status Updated successfully",
          user: userStatusUpdated,
        });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  };

  // Update User
  static updateUser = async (req, res) => {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      userName,
      email,
      phone,
      role,
      oldPassword,
      newPassword,
    } = req.body;

    try {
      const user = await User.findOne({ _id: userId });

      if (!user) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "User not found" });
      }

      if (userName) {
        const userNameAlreadyExist = await User.findOne({
          userName: userName,
          _id: { $ne: userId },
        });

        if (userNameAlreadyExist) {
          return res
            .status(HTTP_STATUS.CONFLICT)
            .json({ message: "UserName already exists" });
        } else {
          user.userName = userName;
        }
      }

      if (firstName) {
        user.firstName = firstName;
      }
      if (lastName) {
        user.lastName = lastName;
      }

      if (email) {
        const emailAlreadyExist = await User.findOne({
          email: email,
          _id: { $ne: userId },
        });

        if (emailAlreadyExist) {
          return res
            .status(HTTP_STATUS.CONFLICT)
            .json({ message: "Email already exists" });
        } else {
          user.email = email;
        }
      }

      if (phone) {
        const phoneAlreadyExist = await User.findOne({
          phone: phone,
          _id: { $ne: userId },
        });

        if (phoneAlreadyExist) {
          return res
            .status(HTTP_STATUS.CONFLICT)
            .json({ message: "Phone already exists" });
        } else {
          user.phone = phone;
        }
      }

      if (oldPassword && newPassword) {
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (passwordMatch) {
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          user.password = hashedPassword;
        } else {
          return res
            .status(HTTP_STATUS.UNAUTHORIZED)
            .json({ message: "Incorrect password please try again" });
        }
      }

      if (role) {
        const selectedRole = await Role.findOne({ _id: role });

        if (!selectedRole) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .json({ message: "Role not found" });
        }

        user.role = selectedRole._id;
      }

      await user.save();

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "User updated successfully", user });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };

  // Delete User
  static deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "User not found" });
      }
      await User.findByIdAndDelete(user._id);
      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };
}

module.exports = UserController;
