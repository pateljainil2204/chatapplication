import User from "../../user/usermodel.js";

const getAllUsersForAdmin = async (req, res) => {
  try {
    const users = await User.find().select("-password"); 
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default getAllUsersForAdmin;
