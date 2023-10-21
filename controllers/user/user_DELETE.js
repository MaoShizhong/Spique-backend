const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const User = require('../../models/User');
const Channel = require('../../models/Channel');

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
    const userID = req.params.userID;
    const userToUnfriend = req.params.friendID;

    if (!ObjectId.isValid(user) || !ObjectId.isValid(userToUnfriend)) {
        return res.status(400).end();
    } else if (userID !== req.user._id) {
        return res.status(401).end();
    }

    const [user, deletedFriend] = await Promise.all([
        User.findByIdAndUpdate(
            user,
            {
                $pull: { friends: { user: userToUnfriend } },
            },
            { new: true }
        ).exec(),
        User.findByIdAndUpdate(userToUnfriend, {
            $pull: { friends: { user: userID } },
        }).exec(),
    ]);

    if (!user || !deletedFriend) {
        res.status(404).end();
    } else {
        await user.populate({ path: 'friends.user', options: { projection: 'username' } });
        res.json(user.friends);
    }
});

exports.leaveChannel = asyncHandler(async (req, res) => {
    const userID = req.params.userID;
    const channelToLeave = req.params.channelID;

    if (!ObjectId.isValid(userID) || !ObjectId.isValid(channelToLeave)) {
        return res.status(400).end();
    } else if (userID !== req.user._id) {
        return res.status(401).end();
    }

    const channelLeft = await Channel.findByIdAndUpdate(
        channelToLeave,
        {
            $pull: { participants: userID },
        },
        { new: true }
    ).exec();

    if (!channelLeft) {
        res.status(404).end();
    } else {
        res.end();
    }
});
