import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import slugify from "slugify";
dotenv.config();
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected`);
        const users = await User.find({});
  for (const user of users) {
    // if slug already set, skip
    if (user.slug) continue;

    const base = slugify(user.name, { lower: true, strict: true });
    const suffix = String(user._id).slice(0, 6);
    user.slug = `${base}-${suffix}`;
    await user.save();
     }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;