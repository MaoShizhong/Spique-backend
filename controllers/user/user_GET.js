const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const User = require('../../models/User');
const Channel = require('../../models/Channel');

exports.getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}, 'username').exec();

    res.json({ users });
});

exports.getSpecificUser = asyncHandler(async (req, res) => {
    if (!ObjectId.isValid(req.params.userID)) {
        return res.status(400).end();
    }

    /*
        ! When auth is implemented, only include channel data is user
        ! is requesting their own information
    */
    const [user, channels] = await Promise.all([
        User.findById(req.params.userID, '-password -email').exec(),
        Channel.find({ participants: req.params.userID }).exec(),
    ]);

    if (!user) {
        res.status(404).end();
    } else {
        res.json({ user, channels });
    }
});

exports.getFriendsList = asyncHandler(async (req, res) => {
    if (!ObjectId.isValid(req.params.userID)) {
        return res.status(400).end();
    }

    const friendsList = await User.findById(req.params.userID, 'friends -_id')
        .populate({ path: 'friends.user', options: { projection: 'username' } })
        .exec();

    if (!friendsList) {
        res.status(404).end();
    } else {
        res.json(friendsList.friends);
    }
});
