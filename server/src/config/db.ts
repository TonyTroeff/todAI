import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn('MONGODB_URI is not defined in environment variables');
      return;
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error instanceof Error ? error.message : error);
    console.warn('Server will continue running without MongoDB connection.');
    console.warn('Please ensure MongoDB is running on mongodb://127.0.0.1:27017');
  }
};

export default connectDB;
