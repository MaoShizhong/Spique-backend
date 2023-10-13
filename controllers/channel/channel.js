const { getChannel } = require('./channel_GET');
const { createNewChannel } = require('./channel_POST');
const { handleChannelEdit } = require('./channel_PUT');

module.exports = { getChannel, createNewChannel, handleChannelEdit };
