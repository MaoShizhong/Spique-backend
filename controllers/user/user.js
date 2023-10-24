const { getUsers, getFriendsList, getChannelList } = require('./user_GET');
const { handleFriendRequest, changeUsername, changeEmail } = require('./user_PUT');
const { deleteUser, removeFriend, leaveChannel } = require('./user_DELETE');

module.exports = {
    getUsers,
    getFriendsList,
    getChannelList,
    handleFriendRequest,
    changeUsername,
    changeEmail,
    deleteUser,
    removeFriend,
    leaveChannel,
};
