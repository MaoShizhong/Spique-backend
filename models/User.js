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
        password: { type: String, required: true },
        friends: [FriendSchema],
    },
    { versionKey: false }
);

module.exports = model('user', UserSchema);
