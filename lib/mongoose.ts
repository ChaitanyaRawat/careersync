import mongoose from "mongoose";

let isConnected = false;  // to check if mongoose is connected or not

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);
    if (!process.env.MONGODB_URL) return console.log("MongoDB URL not found");

    if (isConnected) {
        console.log("MongoDB is already connected");
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URL!);
        isConnected = true;
        console.log("MongoDB connected");
    } catch (error) {
        console.log(error);
    }
}