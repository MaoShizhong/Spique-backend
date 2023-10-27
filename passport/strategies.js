const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.localStrategy = new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            return done(null, false);
        }

        const matchingPassword = bcrypt.compare(password, user.password);
        if (!matchingPassword) {
            return done(null, false);
        }

        return done(null, {
            _id: user._id.valueOf(),
            username: user.username,
            email: user.email,
            isDemo: user.isDemo,
        });
    } catch (err) {
        return done(err);
    }
});

exports.facebookStrategy = new FacebookStrategy(
    {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL:
            process.env.MODE === 'prod'
                ? process.env.PROD_FACEBOOK_CALLBACK_URL
                : process.env.DEV_FACEBOOK_CALLBACK_URL,
        state: true,
        profileFields: ['emails', 'displayName'],
    },
    async (_, __, profile, done) => {
        try {
            const { email, name, id } = profile._json;
            const displayName = name.replaceAll(' ', '');

            const existingUser = await User.findOne({
                auth: 'facebook',
                facebookID: id,
            }).exec();

            if (existingUser) {
                done(null, {
                    _id: existingUser._id.valueOf(),
                    username: existingUser.username,
                    email: existingUser.email,
                    isDemo: existingUser.isDemo,
                    isFacebook: existingUser.auth === 'facebook',
                });
            } else {
                const existingUsernameCount = await User.countDocuments({
                    username: { $regex: displayName },
                }).exec();

                const newUser = new User({
                    username: `${displayName}${existingUsernameCount || ''}`,
                    email: email,
                    friends: [],
                    auth: 'facebook',
                    facebookID: id,
                });

                await newUser.save();

                done(null, {
                    _id: newUser._id.valueOf(),
                    username: newUser.username,
                    email: newUser.email,
                    isDemo: newUser.isDemo,
                    isFacebook: newUser.auth === 'facebook',
                });
            }
        } catch (err) {
            return done(err);
        }
    }
);
