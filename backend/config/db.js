import mongoose from "mongoose";

let connectionPromise;

const connectDb = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!process.env.MONGODB_URL) {
        throw new Error("MONGODB_URL is required");
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 15000
        }).catch((error) => {
            connectionPromise = undefined;
            throw error;
        });
    }

    return connectionPromise;
};

export default connectDb;
