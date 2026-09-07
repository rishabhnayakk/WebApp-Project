import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;
let connectionMode = 'LOCAL_JSON';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<password>') || uri.includes('cluster0.mongodb.net')) {
    console.log('MongoDB: No valid Atlas URI provided, using local JSON storage.');
    connectionMode = 'READY_FOR_ATLAS_URI';
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      dbName: process.env.DB_NAME || 'Dinkal',
    });
    isConnected = true;
    connectionMode = 'MONGODB_ATLAS_CONNECTED';
    console.log(`Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`MongoDB connection failed (${error.message}). Falling back to local storage.`);
    isConnected = false;
    connectionMode = 'DISCONNECTED_FALLBACK';
  }
};

export const getDBStatus = () => {
  return {
    isConnected,
    mode: connectionMode,
    configuredUri: process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@') : 'Not Set',
  };
};

export default connectDB;
