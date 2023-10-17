const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const User = require('../../models/User');
const {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
} = require('../../helpers/friend_requests');

exports.handleFriendRequest = asyncHandler(async (req, res) => {
    if (
        !req.query.userID ||
        !ObjectId.isValid(req.query.userID) ||
        !ObjectId.isValid(req.params.userID)
    ) {
        return res.status(400).end();
    }

    const [self, targetUser] = await Promise.all([
        User.findById(req.params.userID).exec(),
        User.findById(req.query.userID).exec(),
    ]);

    if (!self || !targetUser) return res.status(404).end();

    switch (req.query.action) {
        case 'add':
            sendFriendRequest(self, targetUser);
            break;
        case 'accept':
            acceptFriendRequest(self, targetUser);
            break;
        case 'reject':
            rejectFriendRequest(self, targetUser);
            break;
        default:
            return res.status(400).end();
    }

    await self.populate({ path: 'friends.user', options: { projection: 'username' } });

    res.json(self.friends);
});
