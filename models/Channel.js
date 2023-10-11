const { model, Schema } = require('mongoose');

const ChannelSchema = new Schema(
    {
        name: { type: String, default: undefined },
        participants: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    },
    { versionKey: false }
);

ChannelSchema.virtual('url').get(function () {
    return `/channels/${this._id}`;
});

module.exports = model('channel', ChannelSchema);
