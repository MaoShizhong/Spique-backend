const { userIDs, messageIDs, channelIDs } = require('./test_IDs');
const { ObjectId } = require('mongoose').Types;

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
    ...generateManyTestMessages(90, channelIDs[1], userIDs[2]),
];

function generateManyTestMessages(quantity, channelID, userID) {
    const messages = [];

    for (let i = 1; i <= quantity; i++) {
        messages.push({
            _id: new ObjectId(),
            user: userID,
            channel: channelID,
            timestamp: new Date(Date.now() + i * 10000), // hard prevent same timestamp (lower text value is earlier message)
            text: i.toString(),
        });
    }

    return messages;
}
