const { Router } = require('express');
const {
    getUsers,
    getFriendsList,
    getChannelList,
    sendFriendRequest,
    respondToFriendRequest,
    changeUsername,
    changeEmail,
    deleteUser,
    removeFriend,
} = require('../controllers/user/user');
const { checkAuthenticated } = require('../controllers/auth/auth');

const userRouter = Router();

userRouter.get('/', checkAuthenticated, getUsers);
userRouter.get('/:userID/friends', checkAuthenticated, getFriendsList);
userRouter.get('/:userID/channels', checkAuthenticated, getChannelList);

userRouter.post('/:userID/friends/:targetID', checkAuthenticated, sendFriendRequest);

userRouter.put('/:userID/friends/:targetID', checkAuthenticated, respondToFriendRequest);
userRouter.put('/:userID/username', checkAuthenticated, changeUsername);
userRouter.put('/:userID/email', checkAuthenticated, changeEmail);

userRouter.delete('/:userID', checkAuthenticated, deleteUser);
userRouter.delete('/:userID/friends/:friendID', checkAuthenticated, removeFriend);

module.exports = userRouter;
