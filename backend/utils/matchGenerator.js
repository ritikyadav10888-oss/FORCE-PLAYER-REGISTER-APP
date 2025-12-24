// Match Generation Utilities for Tournaments

/**
 * Get round name based on number of players and current round
 */
function getRoundName(totalPlayers, roundNumber, format) {
    if (format === 'ROUND_ROBIN') {
        return `Round ${roundNumber}`;
    }

    // For Knockout tournaments
    const totalRounds = Math.ceil(Math.log2(totalPlayers));
    const remainingRounds = totalRounds - roundNumber + 1;

    if (remainingRounds === 1) return 'Final';
    if (remainingRounds === 2) return 'Semi Final';
    if (remainingRounds === 3) return 'Quarter Final';
    if (remainingRounds === 4) return 'Round of 16';
    if (remainingRounds === 5) return 'Round of 32';

    return `Round ${roundNumber}`;
}

/**
 * Generate Knockout Tournament Matches
 */
function generateKnockoutMatches(playersList) {
    // Shuffle Players for Random Draw
    const shuffled = [...playersList];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const matches = [];
    const roundName = getRoundName(shuffled.length, 1, 'KNOCKOUT');

    for (let i = 0; i < shuffled.length; i += 2) {
        if (i + 1 < shuffled.length) {
            matches.push({
                player1: {
                    user: shuffled[i].user,
                    name: shuffled[i].teamName || shuffled[i].name
                },
                player2: {
                    user: shuffled[i + 1].user,
                    name: shuffled[i + 1].teamName || shuffled[i + 1].name
                },
                status: 'UPCOMING',
                round: 1,
                roundName: roundName
            });
        } else {
            // Odd number of players - give BYE
            matches.push({
                player1: {
                    user: shuffled[i].user,
                    name: shuffled[i].teamName || shuffled[i].name
                },
                player2: { name: 'BYE' },
                status: 'FINISHED',
                winner: shuffled[i].user,
                score1: 1,
                score2: 0,
                round: 1,
                roundName: roundName
            });
        }
    }

    return matches;
}

/**
 * Generate Round Robin Tournament Matches
 * Every player plays against every other player once
 */
function generateRoundRobinMatches(playersList) {
    const matches = [];
    let matchNumber = 1;

    // Generate all possible pairings
    for (let i = 0; i < playersList.length; i++) {
        for (let j = i + 1; j < playersList.length; j++) {
            matches.push({
                player1: {
                    user: playersList[i].user,
                    name: playersList[i].teamName || playersList[i].name
                },
                player2: {
                    user: playersList[j].user,
                    name: playersList[j].teamName || playersList[j].name
                },
                status: 'UPCOMING',
                round: Math.ceil(matchNumber / Math.floor(playersList.length / 2)),
                roundName: `Round ${Math.ceil(matchNumber / Math.floor(playersList.length / 2))}`
            });
            matchNumber++;
        }
    }

    return matches;
}

/**
 * Main function to generate matches based on format
 */
function generateMatches(playersList, format = 'KNOCKOUT') {
    if (playersList.length < 2) {
        throw new Error('At least 2 players are required');
    }

    if (format === 'ROUND_ROBIN') {
        return generateRoundRobinMatches(playersList);
    } else {
        return generateKnockoutMatches(playersList);
    }
}

module.exports = {
    generateMatches,
    getRoundName
};
