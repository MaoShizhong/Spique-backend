const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const { addUserToChannel, leaveChannel } = require('../../helpers/channels');
const Channel = require('../../models/Channel');

exports.handleChannelEdit = asyncHandler(async (req, res) => {
    // - Error handling
    const [action, requester, target, channelID] = [
        req.query.action,
        req.user._id,
        req.query.target,
        req.params.channelID,
    ];

    if (!action) return res.status(400).end();

    // Check valid objectID values - `target` only exists for 'add' actions
    const objectIds = [channelID];

    if (action === 'add' && !target) {
        return res.status(400).end();
    } else if (action === 'add') {
        objectIds.push(target);
    }

    if (objectIds.some((id) => !ObjectId.isValid(id))) return res.status(400).end();

    // - Take action if no 400 errors from above
    // Default status is 400 in case action is somehow not add/leave
    let [status, shouldDeleteChannel] = [400, false];
    if (action === 'add') {
        status = await addUserToChannel(channelID, requester, target);
    } else if (action === 'leave') {
        [status, shouldDeleteChannel] = await leaveChannel(channelID, requester);
    }

    if (shouldDeleteChannel) {
        await Channel.deleteOne({ _id: channelID });
    }

    res.status(status).end();
});
