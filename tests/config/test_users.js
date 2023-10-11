const { userIDs, channelUserIDs } = require('./test_IDs');

exports.users = [
    {
        _id: userIDs[0],
        username: 'user0',
        email: 'user0@test.com',
        password: 'asdfASDF0',
        friends: [],
    },
    {
        _id: userIDs[1],
        username: 'user1',
        email: 'user1@test.com',
        password: 'asdfASDF1',
        friends: [{ user: userIDs[3], status: 'accepted' }],
    },
    {
        _id: userIDs[2],
        username: 'user2',
        email: 'user2@test.com',
        password: 'asdfASDF2',
        friends: [],
    },
    {
        _id: userIDs[3],
        username: 'user1Friend',
        email: 'user1Friend@test.com',
        password: 'asdfASDF1F',
        friends: [{ user: userIDs[1], status: 'accepted' }],
    },
];

exports.channelUsers = [
    {
        _id: channelUserIDs[0],
        username: 'channelUser0',
        email: 'channelUser0@test.com',
        password: 'asdfASDF0',
        friends: [
            { user: channelUserIDs[1], status: 'accepted' },
            { user: channelUserIDs[2], status: 'accepted' },
        ],
    },
    {
        _id: channelUserIDs[1],
        username: 'channelUser1',
        email: 'channelUser1@test.com',
        password: 'asdfASDF1',
        friends: [{ user: channelUserIDs[0], status: 'accepted' }],
    },
    {
        _id: channelUserIDs[2],
        username: 'channelUser2',
        email: 'channelUser2@test.com',
        password: 'asdfASDF2',
        friends: [{ user: channelUserIDs[0], status: 'accepted' }],
    },
];
