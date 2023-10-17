const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const User = require('../../models/User');

/**
 * ! WILL ADD AUTH TO ONLY ALLOW IF REQUEST IS FROM SAME USER
 */
exports.deleteUser = asyncHandler(async (req, res) => {
    if (!ObjectId.isValid(req.params.userID)) {
        return res.status(400).end();
    }

    const [user] = await Promise.all([
        User.findByIdAndDelete(req.params.userID).exec(),
        User.updateMany({}, { $pull: { friends: { user: req.params.userID } } }).exec(),
    ]);

    if (!user) {
        res.status(404).end();
    } else {
        res.end();
    }
});

exports.removeFriend = asyncHandler(async (req, res) => {
    if (!ObjectId.isValid(req.params.userID) || !ObjectId.isValid(req.query.userID)) {
        return res.status(400).end();
    }

    const [user, deletedFriend] = await Promise.all([
        User.findByIdAndUpdate(
            req.params.userID,
            {
                $pull: { friends: { user: req.query.userID } },
            },
            { new: true }
        ).exec(),
        User.findByIdAndUpdate(req.query.userID, {
            $pull: { friends: { user: req.params.userID } },
        }).exec(),
    ]);

    console.log(user.friends);

    if (!user || !deletedFriend) {
        res.status(404).end();
    } else {
        await user.populate({ path: 'friends.user', options: { projection: 'username' } });
        res.json(user.friends);
    }
});
