const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const User = require('../../models/User');
const Channel = require('../../models/Channel');
const { generateChannelName } = require('../../helpers/channels');

exports.getChannel = asyncHandler(async (req, res) => {
    if (
        !req.query.userID ||
        !ObjectId.isValid(req.query.userID) ||
        !ObjectId.isValid(req.params.channelID)
    ) {
        return res.status(400).end();
    }

    const [user, channel] = await Promise.all([
        User.findById(req.query.userID).exec(),
        Channel.findById(req.params.channelID)
            .populate({ path: 'participants', select: 'username' })
            .exec(),
    ]);

    if (!user || !channel) {
        return res.status(404).end();
    }

    res.json({
        _id: channel._id,
        /* dynamically change channel name depending on who is viewing
        the channel (only if no custom name set) */
        name: channel.name ?? generateChannelName(channel.participants, user.username),
        participants: channel.participants,
    });
});
