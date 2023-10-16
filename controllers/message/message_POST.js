const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Channel = require('../../models/Channel');
const Message = require('../../models/Message');
const { ObjectId } = require('mongoose').Types;

exports.validateMessageForm = body('text')
    .notEmpty()
    .withMessage('Message cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Max. character limit: 2000');

exports.sendNewMessage = asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }

    const channelID = req.params.channelID;
    if (!ObjectId.isValid(channelID)) {
        return res.status(400).end();
    }

    const channel = await Channel.findById(channelID).exec();

    if (!channel) {
        return res.status(404).end();
    } else if (!channel.participants.includes(req.user._id)) {
        return res.status(403).end();
    }

    const message = new Message({
        user: new ObjectId(req.user._id),
        channel: new ObjectId(channelID),
        timestamp: new Date(),
        text: req.body.text,
    });

    await message.save();

    res.status(201).json(message);
});
