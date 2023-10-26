const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports = new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            return done(null, false);
        }

        const matchingPassword = await bcrypt.compare(password, user.password);
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
