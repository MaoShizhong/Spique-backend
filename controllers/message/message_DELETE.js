const asyncHandler = require('express-async-handler');
const Channel = require('../../models/Channel');
const Message = require('../../models/Message');
const { ObjectId } = require('mongoose').Types;

exports.deleteMessage = asyncHandler(async (req, res) => {
    const { messageID, channelID } = req.params;

    if (!ObjectId.isValid(messageID) || !ObjectId.isValid(channelID)) {
        return res.status(400).end();
    }

    const deletedMessage = await Message.findOneAndDelete({
        _id: messageID,
        user: req.user._id,
        channel: channelID,
    }).exec();

    if (!deletedMessage) {
        res.status(404).end();
    } else {
        res.json({ _id: deletedMessage._id });
    }
});
