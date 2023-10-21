const { getChannel } = require('./channel_GET');
const { createNewChannel } = require('./channel_POST');
const { handleChannelEdit } = require('./channel_PUT');
const { editChannelName } = require('./channel_PATCH');

module.exports = { getChannel, createNewChannel, handleChannelEdit, editChannelName };
