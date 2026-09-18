import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { findOrCreateGoogleUser } from '../routes/auth.js';

let isGoogleConfigured = false;

export const configurePassport = () => {
  const clientID = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const callbackURL = `${appUrl}/api/v1/auth/google/callback`;

  if (clientID && clientSecret && !clientID.includes('YOUR_GOOGLE_CLIENT_ID')) {
    try {
      passport.use(
        new GoogleStrategy(
          {
            clientID,
            clientSecret,
            callbackURL,
            proxy: true
          },
          async (accessToken, refreshToken, profile, done) => {
            try {
              const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
              if (!email) {
                return done(new Error('No email address associated with this Google profile.'), null);
              }

              const picture = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '';
              const name = profile.displayName || 
                `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || 
                'Google User';
              const googleId = profile.id;

              // Find existing user or automatically register a new user
              const user = await findOrCreateGoogleUser({
                googleId,
                email,
                name,
                picture
              });

              return done(null, user);
            } catch (err) {
              console.error('Passport Google Strategy error:', err);
              return done(err, null);
            }
          }
        )
      );

      isGoogleConfigured = true;
      console.log(`Passport.js Google OAuth 2.0 strategy initialized. Callback: ${callbackURL}`);
    } catch (e) {
      console.warn('Failed to initialize GoogleStrategy in Passport:', e.message);
    }
  } else {
    isGoogleConfigured = false;
    console.log('Passport.js: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured in .env. Setup guide available at /login.html.');
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    done(null, { id });
  });
};

export const getPassportGoogleStatus = () => {
  const clientID = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  return {
    isConfigured: Boolean(clientID && clientSecret && !clientID.includes('YOUR_GOOGLE_CLIENT_ID')),
    callbackURL: `${appUrl}/api/v1/auth/google/callback`,
    clientID: clientID ? clientID.substring(0, 15) + '...' : ''
  };
};

export default passport;
