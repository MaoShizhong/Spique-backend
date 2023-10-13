const { getAllUsers, getSpecificUser, getFriendsList, getChannelList } = require('./user_GET');
const { validateNewUserForm, addNewUser } = require('./user_POST');
const { handleFriendRequest } = require('./user_PUT');
const { deleteUser, removeFriend } = require('./user_DELETE');

module.exports = {
    getAllUsers,
    getSpecificUser,
    getFriendsList,
    getChannelList,
    validateNewUserForm,
    addNewUser,
    handleFriendRequest,
    deleteUser,
    removeFriend,
};
