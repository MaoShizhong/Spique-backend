const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const { censorUserEmail } = require('../../helpers/email');
const { sendResetEmail } = require('./nodemailer/emails');
const { randomBytes, createHash } = require('node:crypto');

exports.sendPasswordResetEmail = asyncHandler(async (req, res) => {
    const { userID, userEmail } = req.body;
    if (!userID && !userEmail) return res.status(400).end();

    const searchFilter = userID ? { _id: userID } : { email: userEmail };

    const hash = createHash('sha3-256');
    const token = randomBytes(32).toString('base64url');

    const hashedToken = hash.update(token).digest('base64');

    // Storing hashed token prevents anyone other than the recipient getting a usable reset token
    // Expiry set to 10 minutes from generation
    const updatedUser = await User.findOneAndUpdate(searchFilter, {
        reset: { token: hashedToken, expiry: new Date(Date.now() + 10 * 60 * 1000), used: false },
    }).exec();

    if (!updatedUser) {
        res.status(404).end();
    } else {
        // Send unhashed token (usable) to recipient
        sendResetEmail(updatedUser.email, token);
        res.end();
    }
});

exports.verifyPasswordResetToken = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const hash = createHash('sha3-256');
    const hashedToken = hash.update(token).digest('base64');

    const userWithValidToken = await User.findOneAndUpdate(
        { 'reset.token': hashedToken, 'reset.expiry': { $gt: new Date() }, 'reset.used': false },
        { 'reset.used': true }
    ).exec();

    if (!userWithValidToken) {
        res.status(401).end();
    } else {
        res.end();
    }
});

exports.setNewPassword = [
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

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array());
        }

        const { token } = req.params;
        const { password } = req.body;

        const hash = createHash('sha3-256');
        const hashedToken = hash.update(token).digest('base64');

        bcrypt.hash(password, 10, async (err, hashedPassword) => {
            try {
                const updatedUser = await User.findOneAndUpdate(
                    { 'reset.token': hashedToken },
                    { $set: { password: hashedPassword }, $unset: { reset: 1 } },
                    { new: true }
                ).exec();

                // Force user to manually log in after password change
                req.logout((err) => {
                    req.session.destroy();
                    res.clearCookie('connect.sid');

                    if (err) res.status(500).end();
                    else if (!updatedUser) {
                        res.json(404).end();
                    } else {
                        res.json({
                            _id: updatedUser._id,
                            username: updatedUser.username,
                            email: censorUserEmail(updatedUser.email),
                        });
                    }
                });
            } catch (error) {
                // immediately end request and do not modify the user document if password failed to hash
                res.status(500).end();
            }
        });
    }),
];
