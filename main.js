const groups = require('./groups.json'); //read from JSON file

const teams = [...groups.A, ...groups.B, ...groups.C];

const maxRank = Math.max(...teams.map(team => team.FIBARanking));

function probabilityOfWin (rankingA, rankingB, maxRanking) {
    return (0.5 + ((Math.abs(rankingA - rankingB)) / maxRanking) / 2) * 100;
}

function generateGamePoints(){
    const winningTeamPoints = Math.round(Math.random() * (100 - 50) + 50);
    const losingTeamPoints = Math.round(Math.random() * (winningTeamPoints - 1 - 10) + 10);

    return { winningTeamPoints, losingTeamPoints };
}

function gameSimulation (teamA, teamB) { //ko je pobedio, ko je ucestvovao, ko je koliko dao poena
    const result = {
        winTeam: null,
        teamA: teamA,
        teamB: teamB,
        pointsA: 0,
        pointsB: 0
    };

    const probabilityA = probabilityOfWin (teamA.FIBARanking, teamB.FIBARanking, maxRank);//sansa za teamA

    const randomNumberProbability = Math.random() * 100;

    const gamePoints = generateGamePoints();

    if(probabilityA >= randomNumberProbability){//teamA je pobedio
        result.winTeam = teamA;
        result.pointsA = gamePoints.winningTeamPoints;
        result.pointsB = gamePoints.losingTeamPoints;
    }else{
        result.winTeam = teamB;
        result.pointsB = gamePoints.winningTeamPoints;
        result.pointsA = gamePoints.losingTeamPoints;
    }

    return result;
}

console.log(gameSimulation(teams[0], teams[1]));