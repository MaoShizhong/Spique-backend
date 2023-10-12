const { Router } = require('express');
const { getChannel } = require('../controllers/channel/channel_GET');
const { createNewChannel } = require('../controllers/channel/channel_POST');
const { handleChannelEdit } = require('../controllers/channel/channel_PUT');

const channelRouter = Router();

channelRouter.get('/:channelID', getChannel);

channelRouter.post('/', createNewChannel);

channelRouter.put('/:channelID', handleChannelEdit);

module.exports = channelRouter;
