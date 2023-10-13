const { Router } = require('express');
const {
    getChannel,
    createNewChannel,
    handleChannelEdit,
} = require('../controllers/channel/channel');
const {
    getChannelMessages,
    sendNewMessage,
    editMessage,
    deleteMessage,
} = require('../controllers/message/message');

const channelRouter = Router();

channelRouter.get('/:channelID', getChannel);
channelRouter.get('/:channelID/messages', getChannelMessages);

channelRouter.post('/', createNewChannel);
channelRouter.post('/:channelID/messages', sendNewMessage);

channelRouter.put('/:channelID', handleChannelEdit);
channelRouter.put('/:channelID/messages/:messageID', editMessage);

channelRouter.delete('/:channelID/messages/:messageID', deleteMessage);

module.exports = channelRouter;
