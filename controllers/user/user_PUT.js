const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const User = require('../../models/User');
const {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
} = require('../../helpers/friend_requests');
const { censorUserEmail } = require('../../helpers/email');
const { body, validationResult } = require('express-validator');

exports.handleFriendRequest = asyncHandler(async (req, res) => {
    const userID = req.params.userID;
    const targetID = req.query.userID;
    const action = req.query.action;

    if (!targetID || !ObjectId.isValid(userID) || !ObjectId.isValid(targetID)) {
        return res.status(400).end();
    }

    const [self, targetUser] = await Promise.all([
        User.findById(userID).exec(),
        User.findById(targetID).exec(),
    ]);

    if (!self || !targetUser) return res.status(404).end();

    switch (action) {
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

exports.changeUsername = [
    body('username')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters')
        .isAlphanumeric()
        .withMessage('Username can only contain letters A-Z (either case) or numbers'),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).end();
        }

        const { username } = req.body;
        const { _id, email } = req.user;

        const existingUsername = await User.exists({ username: username }).exec();
        if (existingUsername) return res.status(403).end();

        // failsafe for demo account detail change
        const updatedUser = await User.findOneAndUpdate(
            { _id: _id, isDemo: { $ne: true } },
            { username: username },
            { new: true }
        );

        res.json({
            _id: _id,
            username: updatedUser.username,
            email: censorUserEmail(email),
        });
    }),
];

exports.changeEmail = [
    body('email', 'Email must be a valid email format').isEmail(),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).end();
        }

        const { email } = req.body;
        const { _id, username } = req.user;

        const existingEmail = await User.exists({ email: email }).exec();
        if (existingEmail) return res.status(403).end();

        // failsafe for demo account detail change
        const updatedUser = await User.findOneAndUpdate(
            { _id: _id, isDemo: { $ne: true } },
            { email: email },
            { new: true }
        );

        res.json({
            _id: _id,
            username: username,
            email: censorUserEmail(updatedUser.email),
        });
    }),
];
