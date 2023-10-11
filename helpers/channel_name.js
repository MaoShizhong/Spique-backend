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
