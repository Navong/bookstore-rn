import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


export const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URI!);
        console.log(`Connected to MongoDB ${connect.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};