const asyncHandler = require('express-async-handler');
const Channel = require('../../models/Channel');
const Message = require('../../models/Message');
const { ObjectId } = require('mongoose').Types;

exports.deleteMessage = asyncHandler(async (req, res) => {
    const userID = req.query.userID;
    const messageID = req.params.messageID;
    const channelID = req.params.channelID;

    if (!userID || [userID, messageID, channelID].some((id) => !ObjectId.isValid(id))) {
        return res.status(400).end();
    }

    const deletedMessage = await Message.findOneAndDelete({
        _id: messageID,
        user: userID,
        channel: channelID,
    }).exec();

    if (!deletedMessage) {
        res.status(404).end();
    } else {
        res.json({ _id: deletedMessage._id });
    }
});
