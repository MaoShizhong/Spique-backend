const { Router } = require('express');
const {
    validateNewUserForm,
    addNewUser,
    login,
    logout,
    checkAuthenticated,
    verifyPassword,
} = require('../controllers/auth/auth');
const {
    sendPasswordResetEmail,
    verifyPasswordResetToken,
    setNewPassword,
} = require('../controllers/auth/password_reset');
const passport = require('passport');

const authRouter = Router();

authRouter.post('/users', validateNewUserForm, addNewUser);
authRouter.post('/users/:userID/password', checkAuthenticated, verifyPassword);

authRouter.post('/password-tokens', sendPasswordResetEmail);
authRouter.post('/password-tokens/:token', verifyPasswordResetToken);
authRouter.put('/password-tokens/:token', setNewPassword);

authRouter.get('/sessions', checkAuthenticated, login);
authRouter.post('/sessions', passport.authenticate('local'), login);

authRouter.delete('/sessions', checkAuthenticated, logout);

module.exports = authRouter;
