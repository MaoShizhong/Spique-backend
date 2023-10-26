const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const User = require('../../models/User');
const Channel = require('../../models/Channel');

/**
 * ! WILL ADD AUTH TO ONLY ALLOW IF REQUEST IS FROM SAME USER
 */
exports.deleteUser = asyncHandler(async (req, res) => {
    const { userID } = req.params;

    if (!ObjectId.isValid(userID)) {
        return res.status(400).end();
    }

    const [user] = await Promise.all([
        User.findByIdAndDelete(userID).exec(),
        User.updateMany({}, { $pull: { friends: { user: userID } } }).exec(),
    ]);

    if (!user) {
        res.status(404).end();
    } else {
        res.end();
    }
});

exports.removeFriend = asyncHandler(async (req, res) => {
    const { userID, friendID } = req.params;

    if (!ObjectId.isValid(userID) || !ObjectId.isValid(friendID)) {
        return res.status(400).end();
    } else if (userID !== req.user._id) {
        return res.status(401).end();
    }

    const [user, deletedFriend] = await Promise.all([
        User.findByIdAndUpdate(
            user,
            {
                $pull: { friends: { user: friendID } },
            },
            { new: true }
        ).exec(),
        User.findByIdAndUpdate(friendID, {
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
    const { userID, channelID } = req.params.userID;

    if (!ObjectId.isValid(userID) || !ObjectId.isValid(channelID)) {
        return res.status(400).end();
    } else if (userID !== req.user._id) {
        return res.status(401).end();
    }

    const channelLeft = await Channel.findByIdAndUpdate(
        channelID,
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
