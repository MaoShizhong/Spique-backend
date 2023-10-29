const User = require('../models/User');

// Serialize = take user and store something in the session data (in this case, only user._id)
exports.serialize = (user, done) => {
    console.log('---Serialize---');
    console.log('user:', user);
    console.log('---------------');
    return done(null, user._id);
};

// Deserialize = extract session data and store something in req.user
exports.deserialize = async (id, done) => {
    try {
        const user = await User.findById(id).exec();

        console.log('---Deserialize---');
        console.log('id:', id);
        console.log('user', user);
        console.log('---------------');

        done(null, {
            _id: user._id.valueOf(),
            username: user.username,
            email: user.email,
            isDemo: user.isDemo,
            isGithub: user.auth === 'github',
        });
    } catch (error) {
        console.log('---Deerialize---');
        console.log('CATCH:', error);
        console.log('---------------');

        done(error);
    }
};
