const { model, Schema } = require('mongoose');

const MessageSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
        channel: { type: Schema.Types.ObjectId, ref: 'channel', required: true },
        timestamp: { type: Date, required: true },
        text: { type: String, required: true },
    },
    { versionKey: false }
);

module.exports = model('Message', MessageSchema);
