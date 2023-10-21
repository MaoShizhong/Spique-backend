const User = require('../models/User');
const { ObjectId } = require('mongoose').Types;

exports.generateChannelName = (participants, viewer) => {
    const usernames = participants.map((participant) => participant.username);
    const othersUsernames = usernames.filter((username) => username !== viewer);

    if (!othersUsernames.length) {
        return '-- Empty channel --';
    } else if (othersUsernames.length === 1) {
        // e.g. just 'channelUser1'
        return othersUsernames.toString();
    } else if (othersUsernames.length < 4) {
        // e.g. generate 'channelUser1, channelUser2 & channelUser3'
        const namesBeforeAmpersand = othersUsernames.slice(0, -1).join(', ');

        return `${namesBeforeAmpersand} & ${othersUsernames.at(-1)}`;
    } else {
        // e.g. generate 'channelUser1, channelUser2 & 3 others'
        return `${othersUsernames[0]}, ${othersUsernames[1]} & ${
            othersUsernames.length - 2
        } others`;
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

exports.addUserToChannel = async (channel, requester, targetID) => {
    try {
        const target = await User.findById(targetID).exec();

        if (!channel || !requester || !target) {
            return 404;
        }

        const participants = channel.participants.map((participant) => participant._id.valueOf());
        const requesterFriends = requester.friends.map((friend) => friend.user.valueOf());

        if (
            !participants.includes(requester._id.valueOf()) ||
            !requesterFriends.includes(targetID)
        ) {
            return 403;
        } else if (participants.includes(targetID)) {
            return 400;
        }

        channel.participants.push(new ObjectId(targetID));
        await channel.save();
        await channel.populate('participants', 'username');

        return 200;
    } catch (error) {
        return 500;
    }
};

exports.leaveChannel = async (channel, requester) => {
    try {
        if (!channel || !requester) return [404];

        const participants = channel.participants.map((participant) => participant._id.valueOf());

        if (!participants.includes(requester._id.valueOf())) return [404];

        const indexOfRequester = participants.indexOf(requester._id.valueOf());
        channel.participants.splice(indexOfRequester, 1);

        await channel.save();

        const shouldDeleteChannel = channel.participants.length === 0;

        return [200, shouldDeleteChannel];
    } catch (error) {
        return [500];
    }
};
