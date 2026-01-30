import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; 

    next();
  } catch (err) {
    console.log("Authentication Error");
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export default authenticate;