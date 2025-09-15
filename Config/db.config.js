import mongoose from 'mongoose';

export const ConnectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI);
        console.log(`Database Connected Successfully.`);
    } catch (error) {
        console.log((error.message));
        throw new Error(`Something went wrong`, error);
    }
}