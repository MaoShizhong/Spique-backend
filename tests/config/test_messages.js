const { userIDs, messageIDs, channelIDs } = require('./test_IDs');

exports.messages = [
    {
        _id: messageIDs[0],
        user: userIDs[0],
        channel: channelIDs[0],
        timestamp: new Date('2023-10-07T03:24:00'),
        text: 'user0->user1 message0',
    },
    {
        _id: messageIDs[1],
        user: userIDs[0],
        channel: channelIDs[0],
        timestamp: new Date('2023-10-07T04:24:00'),
        text: 'user0->user1 message1',
    },
    {
        _id: messageIDs[2],
        user: userIDs[1],
        channel: channelIDs[0],
        timestamp: new Date('2023-10-07T05:24:00'),
        text: 'user1->user0 message2',
    },
    {
        _id: messageIDs[3],
        user: userIDs[2],
        channel: channelIDs[1],
        timestamp: new Date('2023-10-07T05:24:00'),
        text: 'user2->group message0',
    },
    {
        _id: messageIDs[4],
        user: userIDs[1],
        channel: channelIDs[1],
        timestamp: new Date('2023-10-07T05:24:00'),
        text: 'user1->group message1',
    },
    {
        _id: messageIDs[5],
        user: userIDs[2],
        channel: channelIDs[1],
        timestamp: new Date('2023-10-07T05:24:00'),
        text: 'user2->group message2',
    },
];
