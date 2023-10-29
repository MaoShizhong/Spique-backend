const { Router } = require('express');
const {
    validateNewUserForm,
    addNewUser,
    deleteUser,
    verifyPassword,
    redirectToAutoLogin,
    login,
    loginFromRedirect,
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

authRouter.post('/password-tokens', sendPasswordResetEmail);
authRouter.post('/password-tokens/:token', verifyPasswordResetToken);
authRouter.put('/password-tokens/:token', setNewPassword);

authRouter.get('/sessions', checkAuthenticated, login);
authRouter.post('/sessions/local', passport.authenticate('local'), login);

/*
    ? The following 3 are called automatically in sequence to carry out the following:
    - 1st is called when `login with Github` is selected
    - When the user authorises on Github, Github will call the 2nd endpoint as a redirect automatically
    - The 2nd will redirect to a client page which will then use URL params to call the 3rd endpoint
    - The 3rd uses this to actually log the user in (res.redirect in 2nd cannot set cookie cross-domain)
*/
authRouter.get('/users/github', passport.authenticate('github', { scope: ['user:email'] }));
authRouter.get('/sessions/github', passport.authenticate('github'), redirectToAutoLogin);
authRouter.post('/sessions/github/:token', loginFromRedirect);

authRouter.delete('/sessions', checkAuthenticated, logout);
authRouter.delete('/users/:token', deleteUser);

module.exports = authRouter;
