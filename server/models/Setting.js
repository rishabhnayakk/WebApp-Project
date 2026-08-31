import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  key: { type: String, default: 'global_settings', unique: true },
  appName: { type: String, default: 'Aerosol Webapp' },
  heroTitle: { type: String },
  heroDescription: { type: String },
  brandStatement: { type: String },
  announcementBanner: { type: String },
  footerDescription: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  address: { type: String }
}, {
  timestamps: true
});

const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);
export default Setting;
