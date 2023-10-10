const { model, Schema } = require('mongoose');

const ChannelSchema = new Schema(
    {
        name: { type: String, required: true },
        participants: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    },
    { versionKey: false }
);

module.exports = model('channel', ChannelSchema);
