const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const User = require('../../models/User');
const Channel = require('../../models/Channel');
const { sendDeletionEmail } = require('../auth/nodemailer/emails');
const { randomBytes, createHash } = require('node:crypto');

exports.removeFriend = asyncHandler(async (req, res) => {
    const { userID, friendID } = req.params;

    const demoDeletingMao = req.user.isDemo && friendID === process.env.MAO;

    if (!ObjectId.isValid(userID) || !ObjectId.isValid(friendID)) {
        return res.status(400).end();
    } else if (userID !== req.user._id || demoDeletingMao) {
        return res.status(401).end();
    }

    const [user, deletedFriend] = await Promise.all([
        User.findByIdAndUpdate(
            userID,
            {
                $pull: { friends: { user: friendID } },
            },
            { new: true }
        ).exec(),
        User.findByIdAndUpdate(friendID, {
            $pull: { friends: { user: userID } },
        }).exec(),
    ]);

    if (!user || !deletedFriend) {
        res.status(404).end();
    } else {
        await user.populate({ path: 'friends.user', options: { projection: 'username' } });
        res.json(user.friends);
    }
});

exports.leaveChannel = asyncHandler(async (req, res) => {
    const { userID, channelID } = req.params.userID;

    if (!ObjectId.isValid(userID) || !ObjectId.isValid(channelID)) {
        return res.status(400).end();
    } else if (userID !== req.user._id) {
        return res.status(401).end();
    }

    const channelLeft = await Channel.findByIdAndUpdate(
        channelID,
        {
            $pull: { participants: userID },
        },
        { new: true }
    ).exec();

    if (!channelLeft) {
        res.status(404).end();
    } else {
        res.end();
    }
});

exports.sendDeletionConfirmationEmail = asyncHandler(async (req, res) => {
    const { userID } = req.params;

    const hash = createHash('sha3-256');
    const token = randomBytes(32).toString('base64url');

    const hashedToken = hash.update(token).digest('base64');

    // Storing hashed token prevents anyone other than the recipient getting a usable deletion token
    // Expiry set to 10 minutes from generation
    const updatedUser = await User.findByIdAndUpdate(userID, {
        deletion: { token: hashedToken, expiry: new Date(Date.now() + 10 * 60 * 1000) },
    }).exec();

    if (!updatedUser) {
        res.status(404).end();
    } else {
        // Send unhashed token (usable) to recipient
        sendDeletionEmail(updatedUser.email, token);
        res.end();
    }
});
