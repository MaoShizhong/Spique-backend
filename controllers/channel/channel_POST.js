const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const Channel = require('../../models/Channel');
const { checkFriendStatus } = require('../../helpers/channels');

exports.createNewChannel = asyncHandler(async (req, res) => {
    if (!req.query.creator || !req.query.participants) {
        return res.status(400).end();
    }

    const participants = req.query.participants.split(',');
    const allValidObjectIDs =
        ObjectId.isValid(req.query.creator) && participants.every((id) => ObjectId.isValid(id));

    if (!allValidObjectIDs) {
        return res.status(400).end();
    }

    // Channel creator must be friends with all added participants
    // Participants do not need to be friends with all other participants
    // This also captures any non-existant users by nature of not being in the friends list
    const isFriendsWithAllOthers = await checkFriendStatus(req.query.creator, participants);
    if (!isFriendsWithAllOthers) {
        return res.status(403).end();
    }

    const allParticipants = [
        new ObjectId(req.query.creator),
        ...participants.map((id) => new ObjectId(id)),
    ];
    const newChannel = new Channel({
        participants: allParticipants,
    });

    const addedChannel = await newChannel.save();

    if (!addedChannel) {
        res.status(500).end();
    } else {
        res.json({ newChannelURL: addedChannel.url });
    }
});
