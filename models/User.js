const { model, Schema } = require('mongoose');

const FriendSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
        status: { type: String, enum: ['requested', 'incoming', 'accepted'], required: true },
    },
    { _id: false }
);

const UserSchema = new Schema(
    {
        username: { type: String, unique: true, required: true },
        email: { type: String, unique: true, required: true },
        password: String,
        friends: [FriendSchema],
        isDemo: Boolean,
        reset: {
            token: String,
            expiry: Date,
            used: Boolean,
        },
        auth: { type: String, enum: ['local', 'facebook'], required: true },
        facebookID: String,
    },
    { versionKey: false }
);

module.exports = model('user', UserSchema);
