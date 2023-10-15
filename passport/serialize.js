const User = require('../models/User');

exports.serialize = (user, done) => {
    return done(null, user._id);
};

exports.deserialize = async (id, done) => {
    try {
        const user = await User.findById(id).exec();
        done(null, { _id: user._id.valueOf() });
    } catch (error) {
        done(error);
    }
};
