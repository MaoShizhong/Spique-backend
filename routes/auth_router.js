const { Router } = require('express');
const {
    validateNewUserForm,
    addNewUser,
    login,
    logout,
    checkAuthenticated,
} = require('../controllers/auth/auth');
const passport = require('passport');

const authRouter = Router();

authRouter.post('/users', validateNewUserForm, addNewUser);

authRouter.get('/sessions', checkAuthenticated, login);
authRouter.post('/sessions', passport.authenticate('local'), login);

authRouter.delete('/sessions', checkAuthenticated, logout);

module.exports = authRouter;
