const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Channel = require('../../models/Channel');
const Message = require('../../models/Message');
const { ObjectId } = require('mongoose').Types;

exports.editMessage = asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }

    const messageID = req.params.messageID;
    const channelID = req.params.channelID;

    if (!ObjectId.isValid(messageID) || !ObjectId.isValid(channelID)) {
        return res.status(400).end();
    }

    const [message, channel] = await Promise.all([
        Message.findById(messageID).exec(),
        Channel.findById(channelID).exec(),
    ]);

    if (!message || !channel || message.channel.valueOf() !== channel._id.valueOf()) {
        return res.status(404).end();
    } else if (message.user.valueOf() !== req.user._id) {
        return res.status(403).end();
    }

    message.text = req.body.text;
    message.edited = true;
    await message.save();

    res.json(message);
});
