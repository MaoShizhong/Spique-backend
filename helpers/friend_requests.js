const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;

exports.sendFriendRequest = asyncHandler(async (self, target) => {
    self.friends = [...self.friends, { user: new ObjectId(target._id), status: 'requested' }];
    target.friends = [...target.friends, { user: new ObjectId(self._id), status: 'incoming' }];

    await Promise.all([self.save(), target.save()]);
});

exports.acceptFriendRequest = asyncHandler(async (self, target) => {
    const incoming = self.friends.find((entry) => entry.user.valueOf() === target._id.valueOf());
    const outgoing = target.friends.find((entry) => entry.user.valueOf() === self._id.valueOf());

    incoming.status = 'accepted';
    outgoing.status = 'accepted';

    await Promise.all([self.save(), target.save()]);
});

exports.rejectFriendRequest = asyncHandler(async (self, target) => {
    const incoming = self.friends.findIndex(
        (entry) => entry.user.valueOf() === target._id.valueOf()
    );
    const outgoing = target.friends.findIndex(
        (entry) => entry.user.valueOf() === self._id.valueOf()
    );

    self.friends.splice(incoming, 1);
    target.friends.splice(outgoing, 1);

    await Promise.all([self.save(), target.save()]);
});
