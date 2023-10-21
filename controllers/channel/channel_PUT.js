const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const { addUserToChannel, leaveChannel, generateChannelName } = require('../../helpers/channels');
const Channel = require('../../models/Channel');
const User = require('../../models/User');

exports.handleChannelEdit = asyncHandler(async (req, res) => {
    // - Error handling
    const [action, requesterID, targetID, channelID] = [
        req.query.action,
        req.user._id,
        req.query.target,
        req.params.channelID,
    ];

    if (!action) return res.status(400).end();

    // Check valid objectID values - `target` only exists for 'add' actions
    const objectIds = [channelID];

    if (action === 'add' && !targetID) {
        return res.status(400).end();
    } else if (action === 'add') {
        objectIds.push(targetID);
    }

    if (objectIds.some((id) => !ObjectId.isValid(id))) return res.status(400).end();

    // - Take action if no 400 errors from above
    const [channel, requester] = await Promise.all([
        Channel.findById(channelID).exec(),
        User.findById(requesterID).exec(),
    ]);

    // Default status is 400 in case action is somehow not add/leave
    let [status, shouldDeleteChannel] = [400, false];
    if (action === 'add') {
        status = await addUserToChannel(channel, requester, targetID);
    } else if (action === 'leave') {
        [status, shouldDeleteChannel] = await leaveChannel(channel, requester);
    }

    if (shouldDeleteChannel) {
        await Channel.deleteOne({ _id: channelID });
    }

    console.log(channel.name ?? generateChannelName(channel.participants, req.user.username));

    res.status(status).json({
        newChannelName:
            channel.name ?? generateChannelName(channel.participants, req.user.username),
    });
});
