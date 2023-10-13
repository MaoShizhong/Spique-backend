const { Router } = require('express');
const {
    getAllUsers,
    getSpecificUser,
    getFriendsList,
    getChannelList,
    validateNewUserForm,
    addNewUser,
    handleFriendRequest,
    deleteUser,
    removeFriend,
} = require('../controllers/user/user');

const userRouter = Router();

userRouter.get('/', getAllUsers);
userRouter.get('/:userID', getSpecificUser);
userRouter.get('/:userID/friends', getFriendsList);
userRouter.get('/:userID/channels', getChannelList);

userRouter.post('/', validateNewUserForm, addNewUser);

userRouter.put('/:userID/friends', handleFriendRequest);

userRouter.delete('/:userID', deleteUser);
userRouter.delete('/:userID/friends', removeFriend);

module.exports = userRouter;
