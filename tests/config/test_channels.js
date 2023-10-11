const { channelUserIDs, channelIDs } = require('./test_IDs');

exports.channels = [
    {
        _id: channelIDs[0],
        participants: [channelUserIDs[0], channelUserIDs[1], channelUserIDs[2]],
    },
    {
        _id: channelIDs[1],
        participants: [channelUserIDs[0], channelUserIDs[1]],
    },
];
