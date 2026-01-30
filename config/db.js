import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDb is Connected Successfully");
    
  } catch (err) {
    console.log("Connection failed!", err);
  }
};

export default connectDb;