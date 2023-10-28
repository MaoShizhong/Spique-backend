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
        auth: { type: String, enum: ['local', 'github'], required: true },
        email: { type: String, required: true },
        password: String,
        githubID: String,
        friends: [FriendSchema],
        isDemo: Boolean,
        reset: {
            token: String,
            expiry: Date,
            used: Boolean,
        },
        deletion: {
            token: String,
            expiry: Date,
        },
    },
    { versionKey: false }
);

module.exports = model('user', UserSchema);
