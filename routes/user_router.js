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

userRouter.get('/', getAllUsers);
userRouter.get('/:userID', getSpecificUser);
userRouter.get('/:userID/friends', getFriendsList);
userRouter.get('/:userID/channels', checkAuthenticated, getChannelList);

userRouter.put('/:userID/friends', handleFriendRequest);

userRouter.delete('/:userID', deleteUser);
userRouter.delete('/:userID/friends', removeFriend);

module.exports = userRouter;
