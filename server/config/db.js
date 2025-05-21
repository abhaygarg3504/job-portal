import mongoose from "mongoose";
import dotenv from "dotenv";
import { scheduleSubscriptionCheck } from "../utils/subscriptionRemainder.js";
dotenv.config();
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected`);
        // scheduleSubscriptionCheck()
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
