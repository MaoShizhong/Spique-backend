const { getChannelMessages } = require('./message_GET');
const { sendNewMessage, validateMessageForm } = require('./message_POST');
const { editMessage } = require('./message_PUT');
const { deleteMessage } = require('./message_DELETE');

module.exports = {
    getChannelMessages,
    sendNewMessage,
    validateMessageForm,
    editMessage,
    deleteMessage,
};
