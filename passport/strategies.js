const LocalStrategy = require('passport-local').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
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

exports.githubStrategy = new GithubStrategy(
    {
        clientID: process.env.GITHUB_APP_ID,
        clientSecret: process.env.GITHUB_APP_SECRET,
        callbackURL:
            process.env.MODE === 'prod'
                ? process.env.PROD_GITHUB_CALLBACK_URL
                : process.env.DEV_GITHUB_CALLBACK_URL,
        scope: ['user:email'],
    },
    async (_, __, profile, done) => {
        try {
            const { id, username, emails } = profile;
            const email = emails[0].value;

            const existingUser = await User.findOne({ auth: 'github', githubID: id }).exec();

            if (existingUser) {
                // Update stored email if changed on GH
                // because GH accounts on Spique cannot change their emails on the client
                if (email !== existingUser.email) {
                    existingUser.email = email;
                    await existingUser.save();
                }

                done(null, {
                    _id: existingUser._id.valueOf(),
                    username: existingUser.username,
                    email: email,
                    isDemo: existingUser.isDemo,
                    isGithub: existingUser.auth === 'github',
                });
            } else {
                const usernameRegex = new RegExp(`^${username}\\d*$`);

                const existingUsernameCount = await User.countDocuments({
                    username: { $regex: usernameRegex },
                }).exec();

                const newUser = new User({
                    username: `${username}${existingUsernameCount || ''}`,
                    auth: 'github',
                    email: email,
                    githubID: id,
                    friends: [],
                });

                await newUser.save();

                done(null, {
                    _id: newUser._id.valueOf(),
                    username: newUser.username,
                    email: email,
                    isDemo: newUser.isDemo,
                    isGithub: newUser.auth === 'github',
                });
            }
        } catch (err) {
            return done(err);
        }
    }
);
