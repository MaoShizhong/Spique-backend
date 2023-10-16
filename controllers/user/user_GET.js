const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const User = require('../../models/User');
const Channel = require('../../models/Channel');
const { generateChannelName } = require('../../helpers/channels');

exports.getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}, 'username').exec();

    res.json({ users });
});

exports.getSpecificUser = asyncHandler(async (req, res) => {
    if (!ObjectId.isValid(req.params.userID)) {
        return res.status(400).end();
    }

    const user = await User.findById(req.params.userID, '-password -email').exec();

    if (!user) {
        res.status(404).end();
    } else {
        res.json(user);
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

exports.getChannelList = asyncHandler(async (req, res) => {
    const userID = req.params.userID;

    if (!ObjectId.isValid(userID)) {
        return res.status(400).end();
    } else if (userID !== req.user._id) {
        return res.status(401).end();
    }

    const channelList = await Channel.find({ participants: userID })
        .populate({ path: 'participants', select: 'username -_id' })
        .exec();

    const namedChannelList = channelList.map((channel) => {
        if (!channel.name) {
            channel.name = generateChannelName(channel.participants, req.user.username);
        }

        return channel;
    });

    // channelList will always be an array - empty if no matches found
    res.json(namedChannelList);
});
