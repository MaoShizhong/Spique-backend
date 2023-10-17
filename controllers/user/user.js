const { getUsers, getSpecificUser, getFriendsList, getChannelList } = require('./user_GET');
const { handleFriendRequest } = require('./user_PUT');
const { deleteUser, removeFriend } = require('./user_DELETE');

module.exports = {
    getUsers,
    getSpecificUser,
    getFriendsList,
    getChannelList,
    handleFriendRequest,
    deleteUser,
    removeFriend,
};
