const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const User = require('../../models/User');

exports.sendFriendRequest = asyncHandler(async (req, res) => {
    const { userID, targetID } = req.params;

    if (!targetID || !ObjectId.isValid(userID) || !ObjectId.isValid(targetID)) {
        return res.status(400).end();
    }

    const [validUser, validTarget] = await Promise.all([
        User.exists({ _id: userID }).exec(),
        User.exists({ _id: targetID }).exec(),
    ]);
    if (!validUser || !validTarget) return res.status(404).end();

    const [self] = await Promise.all([
        User.findByIdAndUpdate(
            userID,
            { $push: { friends: { user: new ObjectId(targetID), status: 'requested' } } },
            { new: true }
        ).exec(),
        User.findByIdAndUpdate(targetID, {
            $push: { friends: { user: new ObjectId(userID), status: 'incoming' } },
        }).exec(),
    ]);

    await self.populate({ path: 'friends.user', options: { projection: 'username' } });

    res.json(self.friends);
});
