const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const User = require('../../models/User');
const Channel = require('../../models/Channel');
const { generateChannelName } = require('../../helpers/channels');

exports.getUsers = asyncHandler(async (req, res) => {
    const { search } = req.query;

    if (!search) return res.status(400).end();

    const users = await User.find(
        {
            _id: { $not: { $eq: req.user._id } },
            username: { $regex: search, $options: 'i' },
        },
        'username'
    ).exec();

    res.json(users);
});

exports.getFriendsList = asyncHandler(async (req, res) => {
    const { userID } = req.params;

    console.log('---getFriendsList---');
    console.log('Session:', req.session);
    console.log('Cookies:', req.cookies);
    console.log('User:', req.user);
    console.log('id', userID);
    console.log('---------------');

    if (!ObjectId.isValid(userID)) {
        return res.status(400).end();
    }

    const { friends } = await User.findById(userID, 'friends -_id')
        .populate({ path: 'friends.user', options: { projection: 'username' } })
        .exec();

    if (!friends) {
        res.status(404).end();
    } else {
        res.json(friends);
    }
});

exports.getChannelList = asyncHandler(async (req, res) => {
    const { userID } = req.params;
    const { _id, username } = req.user;

    console.log('---getChannelList---');
    console.log('Session:', req.session);
    console.log('Cookies:', req.cookies);
    console.log('User:', req.user);
    console.log('id', userID);
    console.log('---------------');

    if (!ObjectId.isValid(userID)) {
        return res.status(400).end();
    } else if (userID !== _id) {
        return res.status(401).end();
    }

    const channelList = await Channel.find({ participants: userID })
        .populate('participants', 'username -_id')
        .populate({
            path: 'latestMessage',
            select: 'user text timestamp -_id',
            populate: { path: 'user', select: 'username -_id' },
        })
        .sort({ created: -1 })
        .exec();

    const namedChannelList = channelList.map((channel) => {
        if (!channel.name) {
            channel.name = generateChannelName(channel.participants, username);
        }

        return channel;
    });

    // channelList will always be an array - empty if no matches found
    res.json(namedChannelList);
});
