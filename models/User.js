const { model, Schema } = require('mongoose');

const FriendSchema = new Schema({
    status: { type: String, enum: ['requested', 'incoming', 'accepted'], required: true },
});

const UserSchema = new Schema(
    {
        username: { type: String, unique: true, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        friends: [FriendSchema],
    },
    { versionKey: false }
);

module.exports = model('User', UserSchema);
