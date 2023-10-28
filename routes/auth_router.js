const { Router } = require('express');
const {
    validateNewUserForm,
    addNewUser,
    deleteUser,
    verifyPassword,
    redirectToDashboard,
    login,
    logout,
    checkAuthenticated,
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
authRouter.get('/users/github', passport.authenticate('github', { scope: ['user:email'] }));

authRouter.post('/password-tokens', sendPasswordResetEmail);
authRouter.post('/password-tokens/:token', verifyPasswordResetToken);
authRouter.put('/password-tokens/:token', setNewPassword);

authRouter.get('/sessions', checkAuthenticated, login);
authRouter.get('/sessions/github', passport.authenticate('github'), redirectToDashboard);
authRouter.post('/sessions/local', passport.authenticate('local'), login);

authRouter.delete('/sessions', checkAuthenticated, logout);
authRouter.delete('/users/:token', deleteUser);

module.exports = authRouter;
