import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;
let connectionMode = 'LOCAL_JSON_FALLBACK';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<password>') || uri.includes('cluster0.mongodb.net')) {
    console.log('ℹ️  MongoDB Atlas: Demo URI detected or not set. Running in Local JSON sync mode with Atlas support ready.');
    connectionMode = 'READY_FOR_ATLAS_URI';
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    connectionMode = 'MONGODB_ATLAS_CONNECTED';
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB Atlas Connection Notice: ${error.message}. Operating with local persistent JSON fallback.`);
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
