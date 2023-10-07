const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const User = require('../models/User');

const userRouter = Router();

userRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const users = await User.find().exec();

        res.json({ count: users.length });
    })
);

userRouter.get(
    '/:userID',
    asyncHandler(async (req, res) => {
        if (!ObjectId.isValid(req.params.userID)) {
            return res.status(400).json({ error: 'Invalid ObjectID pattern' });
        }

        const user0 = await User.findById(req.params.userID, 'username -_id').exec();

        if (!user0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json(user0);
        }
    })
);

module.exports = userRouter;
