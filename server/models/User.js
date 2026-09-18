import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, default: null }, // Null for OAuth-only users, never exposed
  picture: { type: String, default: '' }, // Google profile picture
  googleId: { type: String, default: null, index: true }, // Google OAuth User ID
  phone: { type: String, default: '' },
  company: { type: String, default: '' },
  dob: { type: String, default: '' },
  role: { type: String, enum: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'], default: 'CUSTOMER' },
  tier: { type: String, default: 'Standard Member' },
  discountTier: { type: Number, default: 0 },
  termsAccepted: { type: Boolean, default: true },
  privacyAccepted: { type: Boolean, default: true },
  marketingAccepted: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  mfaEnabled: { type: Boolean, default: false },
  authProviders: { type: [String], default: ['email'] }, // e.g. ['email', 'google']
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'], default: 'ACTIVE' },
  addresses: { type: Array, default: [] },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
