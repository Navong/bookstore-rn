import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URI || "");
        console.log(`Connected to MongoDB ${connect.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};