const { Router } = require('express');
const {
    getChannel,
    createNewChannel,
    handleChannelEdit,
    editChannelName,
} = require('../controllers/channel/channel');
const {
    getChannelMessages,
    sendNewMessage,
    validateMessageForm,
    editMessage,
    deleteMessage,
} = require('../controllers/message/message');
const { checkAuthenticated } = require('../controllers/auth/auth');

const channelRouter = Router();

channelRouter.get('/:channelID', checkAuthenticated, getChannel);
channelRouter.get('/:channelID/messages', checkAuthenticated, getChannelMessages);

channelRouter.post('/', checkAuthenticated, createNewChannel);
channelRouter.post('/:channelID/messages', checkAuthenticated, validateMessageForm, sendNewMessage);

channelRouter.put('/:channelID', checkAuthenticated, handleChannelEdit);
channelRouter.put(
    '/:channelID/messages/:messageID',
    checkAuthenticated,
    validateMessageForm,
    editMessage
);

channelRouter.patch('/:channelID', checkAuthenticated, editChannelName);

channelRouter.delete('/:channelID/messages/:messageID', checkAuthenticated, deleteMessage);

module.exports = channelRouter;
