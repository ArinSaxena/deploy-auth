const UserModel = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')    // jwt token

const signup = async (req, res) => {
  try {

    const { name, email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (user) {

      return res
        .status(409)
        .json({ message: "User already exist, you can login ", success: false });
    }


     // const uesrdata= await user.create(data);
    const userModel = new UserModel({ name, email, password });
    // Before saving or creating account we will first encrypt the password
    userModel.password = await bcrypt.hash(password, 10);

    await userModel.save();
    res.status(201).json({
      message: "Signup Successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    const errorMsg = "Auth failed, email or password is wrong";

    if (!user) {
      return res.status(403).json({ message: errorMsg, success: false });
    }

    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      return res.status(403).json({ message: errorMsg, success: false });
    }

    const jwtToken = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Log the generated JWT token to the console
    console.log("Generated JWT Token:", jwtToken);

    res.status(200).json({
      message: "Login Successfully",
      success: true,
      jwtToken,
      email:email,
      name:user.name
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};


module.exports = {
  signup,
  login,
};