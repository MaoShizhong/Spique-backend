const { Router } = require('express');
const {
    getUsers,
    getSpecificUser,
    getFriendsList,
    getChannelList,
    handleFriendRequest,
    deleteUser,
    removeFriend,
    leaveChannel,
} = require('../controllers/user/user');
const { checkAuthenticated } = require('../controllers/auth/auth');

const userRouter = Router();

userRouter.get('/', checkAuthenticated, getUsers);
userRouter.get('/:userID', checkAuthenticated, getSpecificUser);
userRouter.get('/:userID/friends', checkAuthenticated, getFriendsList);
userRouter.get('/:userID/channels', checkAuthenticated, getChannelList);

userRouter.put('/:userID/friends', checkAuthenticated, handleFriendRequest);

userRouter.delete('/:userID', checkAuthenticated, deleteUser);
userRouter.delete('/:userID/friends/:friendID', checkAuthenticated, removeFriend);

module.exports = userRouter;
