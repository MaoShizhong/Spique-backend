const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const { censorUserEmail } = require('../../helpers/email');

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

    const [existingUsername, existingEmail] = await Promise.all([
        User.exists({ username: req.body.username }).exec(),
        User.exists({ email: req.body.email }).exec(),
    ]);

    const existErrors = [];
    if (existingUsername) existErrors.push({ msg: 'Username already in use' });
    if (existingEmail) existErrors.push({ msg: 'Email already in use' });

    if (existErrors.length) {
        return res.status(400).json(existErrors);
    }

    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        try {
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                friends: [],
            });

            await newUser.save();
            next();
        } catch (error) {
            res.status(400).end();
        }
    });
});

exports.verifyPassword = asyncHandler(async (req, res) => {
    // because password is not stored in req.user by default
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).end();

    const matchingPassword = await bcrypt.compare(req.body.password, user.password);

    if (matchingPassword) {
        res.end();
    } else {
        res.status(401).end();
    }
});

exports.login = (req, res) => {
    const { _id, username, email, isDemo } = req.user;

    res.status(201).json({
        _id: _id,
        username: username,
        email: censorUserEmail(email),
        isDemo: isDemo,
    });
};

exports.logout = (req, res, next) => {
    req.logout((err) => {
        req.session.destroy();
        res.clearCookie('connect.sid');

        if (err) next(err);
        else res.end();
    });
};

exports.checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) next();
    else res.status(401).end();
};
