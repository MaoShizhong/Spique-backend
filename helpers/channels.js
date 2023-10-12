const User = require('../models/User');
const Channel = require('../models/Channel');
const { ObjectId } = require('mongoose').Types;

exports.generateChannelName = (participants, viewer) => {
    const usernames = participants.map((participant) => participant.username);
    const othersUsernames = usernames.filter((username) => username !== viewer);

    if (othersUsernames.length === 1) {
        // e.g. just 'channelUser1'
        return othersUsernames.toString();
    } else {
        // e.g. generate 'channelUser1, channelUser2 & channelUser3'
        const namesBeforeAmpersand = othersUsernames.slice(0, -1).join(', ');

        return `${namesBeforeAmpersand} & ${othersUsernames.at(-1)}`;
    }
};

exports.checkFriendStatus = async (creatorID, participants) => {
    try {
        const creator = await User.findById(creatorID).exec();
        if (!creator) return false;

        const friendsIDs = creator.friends.map((friend) => friend.user.valueOf());

        return participants.every((participant) => friendsIDs.includes(participant));
    } catch (error) {
        return false;
    }
};

exports.addUserToChannel = async (channelID, requesterID, targetID) => {
    try {
        const [channel, requester, target] = await Promise.all([
            Channel.findById(channelID).exec(),
            User.findById(requesterID).exec(),
            User.findById(targetID).exec(),
        ]);

        if (!channel || !requester || !target) {
            return 404;
        }

        const participants = channel.participants.map((participant) => participant.valueOf());
        const requesterFriends = requester.friends.map((friend) => friend.user.valueOf());

        if (!participants.includes(requesterID) || !requesterFriends.includes(targetID)) {
            return 403;
        } else if (participants.includes(targetID)) {
            return 400;
        }

        channel.participants.push(new ObjectId(targetID));
        await channel.save();

        return 200;
    } catch (error) {
        return 500;
    }
};

exports.leaveChannel = async (channelID, requesterID) => {
    try {
        const [channel, requester] = await Promise.all([
            Channel.findById(channelID).exec(),
            User.findById(requesterID).exec(),
        ]);

        if (!channel || !requester) {
            return [404];
        }

        const participants = channel.participants.map((participant) => participant.valueOf());
        if (!participants.includes(requesterID)) return [404];

        const indexOfRequester = participants.indexOf(requesterID);
        channel.participants.splice(indexOfRequester, 1);
        await channel.save();

        const shouldDeleteChannel = channel.participants.length === 0;

        return [200, shouldDeleteChannel];
    } catch (error) {
        return [500];
    }
};
