const { Router } = require('express');
const { getAllUsers, getSpecificUser, getFriendsList } = require('../controllers/user/user_GET');
const { validateNewUserForm, addNewUser } = require('../controllers/user/user_POST');
const { handleFriendRequest } = require('../controllers/user/user_PUT');
const { deleteUser, removeFriend } = require('../controllers/user/user_DELETE');

const userRouter = Router();

userRouter.get('/', getAllUsers);
userRouter.get('/:userID', getSpecificUser);
userRouter.get('/:userID/friends', getFriendsList);

userRouter.post('/', validateNewUserForm, addNewUser);

userRouter.put('/:userID/friends', handleFriendRequest);

userRouter.delete('/:userID', deleteUser);
userRouter.delete('/:userID/friends', removeFriend);

module.exports = userRouter;
