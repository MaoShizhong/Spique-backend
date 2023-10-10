const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const User = require('../../models/User');

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

exports.addNewUser = asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
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
            res.status(201).json({ _id: newUser._id, username: newUser.username });
        } catch (error) {
            // immediately end request and do not create new user if password failed to hash
            res.status(500).end();
        }
    });
});
