exports.censorUserEmail = (email) => {
    const indexOfAt = email.indexOf('@');

    const firstHalf = email.slice(0, indexOfAt);
    const secondHalf = email.slice(indexOfAt);

    let censoredFirstHalf;
    switch (firstHalf.length) {
        case 1:
            censoredFirstHalf = '*';
            break;
        case 2:
            censoredFirstHalf = `${firstHalf[0]}*`;
            break;
        default:
            censoredFirstHalf = `${firstHalf[0]}${'*'.repeat(firstHalf.length - 2)}${firstHalf.at(
                -1
            )}`;
    }

    return `${censoredFirstHalf}${secondHalf}`;
};
