const { getUsers, getFriendsList, getChannelList } = require('./user_GET');
const { sendFriendRequest } = require('./user_POST');
const { respondToFriendRequest, changeUsername, changeEmail } = require('./user_PUT');
const { deleteUser, removeFriend, leaveChannel } = require('./user_DELETE');

module.exports = {
    getUsers,
    getFriendsList,
    getChannelList,
    sendFriendRequest,
    respondToFriendRequest,
    changeUsername,
    changeEmail,
    deleteUser,
    removeFriend,
    leaveChannel,
};
