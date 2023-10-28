const User = require('../models/User');

// Serialize = take user and store something in the session data (in this case, only user._id)
exports.serialize = (user, done) => {
    return done(null, user._id);
};

// Deserialize = extract session data and store something in req.user
exports.deserialize = async (id, done) => {
    try {
        const user = await User.findById(id).exec();
        done(null, {
            _id: user._id.valueOf(),
            username: user.username,
            email: user.email,
            isDemo: user.isDemo,
            isGithub: user.auth === 'github',
        });
    } catch (error) {
        done(error);
    }
};
