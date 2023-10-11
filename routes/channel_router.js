const { Router } = require('express');
const { getChannel } = require('../controllers/channel/channel_GET');
const { createNewChannel } = require('../controllers/channel/channel_POST');

const channelRouter = Router();

channelRouter.get('/:channelID', getChannel);

channelRouter.post('/', createNewChannel);

module.exports = channelRouter;
