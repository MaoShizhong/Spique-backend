const { ObjectId } = require('mongoose').Types;

const IDs = {
    userIDs: [
        new ObjectId('65218a70437ced46f36858d8'),
        new ObjectId('65218ac212fde91aa80bd115'),
        new ObjectId('65218ac5dc04264ac8a44906'),
    ],
    messageIDs: [
        new ObjectId('65218ac99fdd95b5505e56f9'),
        new ObjectId('65218b1cdf64387e57489053'),
        new ObjectId('65218b21d2fd466660b98522'),
        new ObjectId('65218cc1b761c71d2a0bf40f'),
        new ObjectId('65218cc48d32c49f7899b479'),
        new ObjectId('65218cc621777ee78ca7e4b5'),
    ],
    channelIDs: [
        new ObjectId('65218cd0a863d7b4539518eb'),
        new ObjectId('65218cdb106a96279ad1a482'),
    ],
};

const users = [
    {
        _id: IDs.userIDs[0],
        username: 'user0',
        email: 'user0@test.com',
        password: 'asdfASDF0',
        friends: [],
    },
    {
        _id: IDs.userIDs[1],
        username: 'user1',
        email: 'user1@test.com',
        password: 'asdfASDF1',
        friends: [],
    },
    {
        _id: IDs.userIDs[2],
        username: 'user2',
        email: 'user2@test.com',
        password: 'asdfASDF2',
        friends: [],
    },
];

const messages = [
    {
        _id: IDs.messageIDs[0],
        user: IDs.userIDs[0],
        channel: IDs.channelIDs[0],
        timestamp: new Date('2023-10-07T03:24:00'),
        text: 'user0->user1 message0',
    },
    {
        _id: IDs.messageIDs[1],
        user: IDs.userIDs[0],
        channel: IDs.channelIDs[0],
        timestamp: new Date('2023-10-07T04:24:00'),
        text: 'user0->user1 message1',
    },
    {
        _id: IDs.messageIDs[2],
        user: IDs.userIDs[1],
        channel: new ObjectId('65218a70437ced46f36858d8'),
        timestamp: new Date('2023-10-07T05:24:00'),
        text: 'user1->user0 message2',
    },
    {
        _id: IDs.messageIDs[3],
        user: IDs.userIDs[2],
        channel: IDs.channelIDs[1],
        timestamp: new Date('2023-10-07T05:24:00'),
        text: 'user2->group message0',
    },
    {
        _id: IDs.messageIDs[4],
        user: IDs.userIDs[1],
        channel: IDs.channelIDs[1],
        timestamp: new Date('2023-10-07T05:24:00'),
        text: 'user1->group message1',
    },
    {
        _id: IDs.messageIDs[5],
        user: IDs.userIDs[2],
        channel: IDs.channelIDs[1],
        timestamp: new Date('2023-10-07T05:24:00'),
        text: 'user2->group message2',
    },
];

const channels = [
    {
        _id: IDs.channelIDs[0],
        name: 'user1user2',
        participants: [IDs.userIDs[0], IDs.userIDs[1]],
    },
    {
        _id: IDs.channelIDs[1],
        name: 'user1user2user3',
        participants: [IDs.userIDs[0], IDs.userIDs[1], IDs.userIDs[2]],
    },
];

module.exports = { users, messages, channels };
