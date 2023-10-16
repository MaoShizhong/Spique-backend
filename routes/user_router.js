const { Router } = require('express');
const {
    getAllUsers,
    getSpecificUser,
    getFriendsList,
    getChannelList,
    handleFriendRequest,
    deleteUser,
    removeFriend,
} = require('../controllers/user/user');
const { checkAuthenticated } = require('../controllers/auth/auth');

const userRouter = Router();

userRouter.get('/', checkAuthenticated, getAllUsers);
userRouter.get('/:userID', checkAuthenticated, getSpecificUser);
userRouter.get('/:userID/friends', checkAuthenticated, getFriendsList);
userRouter.get('/:userID/channels', checkAuthenticated, getChannelList);

userRouter.put('/:userID/friends', checkAuthenticated, handleFriendRequest);

userRouter.delete('/:userID', checkAuthenticated, deleteUser);
userRouter.delete('/:userID/friends', checkAuthenticated, removeFriend);

module.exports = userRouter;
