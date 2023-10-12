const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const { addUserToChannel, leaveChannel } = require('../../helpers/channels');

exports.handleChannelEdit = asyncHandler(async (req, res) => {
    // - Error handling
    const [action, requester, target, channelID] = [
        req.query.action,
        req.query.requester,
        req.query.target,
        req.params.channelID,
    ];

    if (!action || !requester) return res.status(400).end();

    const objectIds = [channelID, requester];

    if (action === 'add' && !target) {
        return res.status(400).end();
    } else if (action === 'add') {
        objectIds.push(target);
    }

    if (objectIds.some((id) => !ObjectId.isValid(id))) return res.status(400).end();

    // - Take action if no 400 errors
    let status = 400;

    if (action === 'add') {
        status = await addUserToChannel(channelID, requester, target);
    } else if (action === 'leave') {
        status = await leaveChannel(channelID, requester);
    }

    res.status(status).end();
});
