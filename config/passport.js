const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userSchema');


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const profilePictureUrl = profile.photos?.[0]?.value || null;

        const existingUser = await User.findOne({
          googleId: profile.id
        });

        if (existingUser) {
          
          if (!existingUser.googleProfilePicture && profilePictureUrl) {
            existingUser.googleProfilePicture = profilePictureUrl;
            await existingUser.save();
          }

          return done(null, existingUser);
        }

        const existingEmailUser = await User.findOne({
          email: profile.emails[0].value
        });

        if (existingEmailUser) {
          return done(
            new Error('An account with this email already exists. Please log in using your password'), null
          );
        }

        const googleEmail = profile.emails?.[0];

        if (!googleEmail || googleEmail.verified === false) {
          return done(
            new Error('Google email could not be verified'), null
          );
        }

        const newUser = await User.create({
          name: profile.displayName,
          email: googleEmail.value.toLowerCase(),
          googleProfilePicture: profilePictureUrl,
          googleId: profile.id,
          authProvider: 'google',
          isVerified: true
        });

        return done(null, newUser);
        
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;