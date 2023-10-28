const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const Channel = require('../../models/Channel');
const { censorUserEmail } = require('../../helpers/email');
const { createHash, randomBytes } = require('node:crypto');

exports.validateNewUserForm = [
    body('username')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters')
        .isAlphanumeric()
        .withMessage('Username can only contain letters A-Z (either case) or numbers'),

    body('email')
        .notEmpty()
        .withMessage('Email cannot be empty')
        .isEmail()
        .withMessage('Email must be a valid email format'),

    body(
        'password',
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter and one number'
    ).isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    }),

    body('confirm', 'Passwords must match').custom(
        (confirm, { req }) => confirm === req.body.password
    ),
];

exports.addNewUser = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }

    const { username, email, password } = req.body;

    const [existingUsername] = await User.exists({ username: username }).exec();

    const existErrors = [];
    if (existingUsername) existErrors.push({ msg: 'Username already in use' });

    if (existErrors.length) {
        return res.status(400).json(existErrors);
    }

    bcrypt.hash(password, 10, async (err, hashedPassword) => {
        try {
            const newUser = new User({
                username: username,
                email: email,
                password: hashedPassword,
                friends: [],
                auth: 'local',
            });

            await newUser.save();
            next();
        } catch (error) {
            res.status(400).end();
        }
    });
});

exports.deleteUser = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const hash = createHash('sha3-256');
    const hashedToken = hash.update(token).digest('base64');

    const userWithValidDeletionToken = await User.findOneAndDelete({
        'deletion.token': hashedToken,
        'deletion.expiry': { $gt: new Date() },
    }).exec();

    if (!userWithValidDeletionToken) {
        res.status(401).end();
    } else {
        const _id = userWithValidDeletionToken._id;

        await Promise.all([
            User.updateMany({ 'friends.user': _id }, { $pull: { friends: { user: _id } } }).exec(),
            Channel.updateMany({ participants: _id }, { $pull: { participants: _id } }).exec(),
        ]);

        if (req.session) req.session.destroy();

        res.clearCookie('connect.sid', {
            secure: process.env.MODE === 'prod',
            maxAge: 2 * 24 * 60 * 60 * 1000,
            httpOnly: process.env.MODE === 'prod',
            sameSite: process.env.MODE === 'prod' ? 'none' : 'lax',
        });
        res.end();
    }
});

exports.verifyPassword = asyncHandler(async (req, res) => {
    // because password is not stored in req.user by default
    const user = await User.findById(req.user._id).exec();

    if (!user) return res.status(404).end();

    const matchingPassword = bcrypt.compare(req.body.password, user.password);

    if (matchingPassword) {
        res.end();
    } else {
        res.status(401).end();
    }
});

exports.redirectToDashboard = asyncHandler(async (req, res) => {
    const baseRedirectURL =
        process.env.MODE === 'prod' ? process.env.PROD_CLIENT : process.env.DEV_CLIENT;

    const hash = createHash('sha3-256');
    const token = randomBytes(32).toString('base64url');

    const hashedToken = hash.update(token).digest('base64');

    // Storing hashed token prevents anyone other than the recipient getting a usable reset token
    // Token will be used immediately by the client once loaded, which should verify then log in
    await User.findByIdAndUpdate(req.session.passport.user, {
        loginToken: hashedToken,
    }).exec();

    const redirectURL = `${baseRedirectURL}/login/${token}`;
    res.redirect(redirectURL);
});

exports.login = (req, res) => {
    const { _id, username, email, isDemo, isGithub } = req.user;

    res.status(201).json({
        _id: _id,
        username: username,
        email: censorUserEmail(email),
        isDemo: isDemo,
        isGithub: isGithub,
    });
};

exports.logout = (req, res, next) => {
    req.logout((err) => {
        req.session.destroy();
        res.clearCookie('connect.sid', {
            secure: process.env.MODE === 'prod',
            maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days (refreshed every successful request)
            httpOnly: process.env.MODE === 'prod',
            sameSite: process.env.MODE === 'prod' ? 'none' : 'lax',
        });

        if (err) next(err);
        else res.end();
    });
};

exports.checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({ msg: [req.session, req.user, req.cookies] });
    }
};

exports.loginFromRedirect = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const hash = createHash('sha3-256');
    const hashedToken = hash.update(token).digest('base64');

    const existingUser = await User.findOneAndUpdate(
        { loginToken: hashedToken },
        { $unset: { loginToken: 1 } },
        { new: true }
    ).exec();

    if (!existingUser) {
        res.status(404).end();
    } else {
        res.status(201).json({
            _id: existingUser._id,
            username: existingUser.username,
            email: censorUserEmail(existingUser.email),
            isDemo: existingUser.isDemo,
            isGithub: existingUser.auth === 'github',
        });
    }
});
