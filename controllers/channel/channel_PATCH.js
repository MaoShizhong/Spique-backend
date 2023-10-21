const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const { generateChannelName } = require('../../helpers/channels');
const Channel = require('../../models/Channel');

exports.editChannelName = [
    asyncHandler(async (req, res) => {
        if (!ObjectId.isValid(req.params.channelID)) {
            return res.status(400).end();
        }

        const channel = await Channel.findByIdAndUpdate(
            req.params.channelID,
            { name: req.body.name.trim() || null },
            { new: true }
        )
            .populate('participants', 'username')
            .exec();

        if (!channel) {
            res.status(404).end();
        } else {
            res.json({
                newChannelName:
                    channel.name ?? generateChannelName(channel.participants, req.user.username),
            });
        }
    }),
];
