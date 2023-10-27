const { Router } = require('express');
const {
    validateNewUserForm,
    addNewUser,
    redirectToDashboard,
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

authRouter.post('/users', validateNewUserForm, addNewUser, passport.authenticate('local'), login);
authRouter.post('/users/:userID/password', checkAuthenticated, verifyPassword);
authRouter.get('/users/facebook', passport.authenticate('facebook', { scope: ['email'] }));

authRouter.post('/password-tokens', sendPasswordResetEmail);
authRouter.post('/password-tokens/:token', verifyPasswordResetToken);
authRouter.put('/password-tokens/:token', setNewPassword);

authRouter.get('/sessions', checkAuthenticated, login);
authRouter.get('/sessions/facebook', passport.authenticate('facebook'), redirectToDashboard);
authRouter.post('/sessions/local', passport.authenticate('local'), login);

authRouter.delete('/sessions', checkAuthenticated, logout);

module.exports = authRouter;
