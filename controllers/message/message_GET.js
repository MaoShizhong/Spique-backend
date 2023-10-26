const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const Message = require('../../models/Message');

exports.getChannelMessages = asyncHandler(async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const MESSAGES_PER_PAGE = 40;

    const { channelID } = req.params;

    if (page < 1 || Number.isNaN(page) || !ObjectId.isValid(channelID)) {
        return res.status(400).end();
    }

    const [messages, messageCount] = await Promise.all([
        Message.find({ channel: channelID })
            .sort({ timestamp: -1 })
            .skip(MESSAGES_PER_PAGE * (page - 1))
            .limit(MESSAGES_PER_PAGE)
            .select('-channel')
            .populate('user', 'username')
            .exec(),
        Message.countDocuments({ channel: channelID }).exec(),
    ]);

    const allPreviousPagesMessages = (page - 1) * MESSAGES_PER_PAGE;

    res.json({
        messages: messages,
        hasMoreMessages: messageCount > messages.length + allPreviousPagesMessages,
    });
});
