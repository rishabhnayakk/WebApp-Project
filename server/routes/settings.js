import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { getDBStatus } from '../config/db.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const settingsFilePath = path.join(__dirname, '../data/settings.json');

const getSettings = () => {
  try {
    const data = fs.readFileSync(settingsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {
      appName: 'Aerosol Webapp',
      heroTitle: 'Precision aerosol engineering for every application.',
      heroDescription: 'Professional aerosol formulations for aerospace, automotive, electronics, and industrial applications.',
      brandStatement: '"Aerosol products engineered for performance, reliability, and every industrial challenge."',
      announcementBanner: 'ISO 9001:2015 · DOT-SP Certified · UN1950 Compliant',
      footerDescription: 'Precision aerosol formulations engineered for aerospace, automotive, electronics, and medical applications.',
      contactEmail: 'engineering@aerosolwebapp.com',
      contactPhone: '+1 (800) 555-AERO',
      address: '740 Aerospace Blvd, Cleanroom Facility, Seattle, WA 98108'
    };
  }
};

const saveSettings = (settings) => {
  try {
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (err) {
    return false;
  }
};

router.get('/', (req, res) => {
  res.json({ success: true, data: getSettings() });
});

router.put('/', (req, res) => {
  const current = getSettings();
  const updated = { ...current, ...req.body };
  saveSettings(updated);
  res.json({ success: true, message: 'Settings and web app description updated successfully', data: updated });
});

router.get('/db-status', (req, res) => {
  res.json({
    success: true,
    data: getDBStatus()
  });
});

router.post('/db-connect', async (req, res) => {
  const { mongoUri } = req.body;
  if (!mongoUri) {
    return res.status(400).json({ success: false, message: 'MongoDB Connection URI is required' });
  }

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    res.json({
      success: true,
      message: 'Successfully connected to MongoDB Atlas!',
      data: {
        isConnected: true,
        host: mongoose.connection.host,
        dbName: mongoose.connection.name,
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to connect to MongoDB Atlas: ${err.message}`
    });
  }
});

export default router;
