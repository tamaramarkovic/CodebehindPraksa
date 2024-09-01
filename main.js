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

function gameSimulation (firstTeam, secondTeam) { //ko je pobedio, ko je ucestvovao, ko je koliko dao poena
    const result = {
        winTeam: null,
        firstTeam: firstTeam,
        secondTeam: secondTeam,
        firstTeamPoints: 0,
        secondTeamPoints: 0
    };

    const probabilityA = probabilityOfWin (firstTeam.FIBARanking, secondTeam.FIBARanking, maxRank);//sansa za teamA

    const randomNumberProbability = Math.random() * 100;

    const gamePoints = generateGamePoints();

    if(probabilityA >= randomNumberProbability){//teamA je pobedio
        result.winTeam = firstTeam;
        result.firstTeamPoints = gamePoints.winningTeamPoints;
        result.secondTeamPoints = gamePoints.losingTeamPoints;
    }else{
        result.winTeam = secondTeam;
        result.secondTeamPoints = gamePoints.winningTeamPoints;
        result.firstTeamPoints = gamePoints.losingTeamPoints;
    }

    return result;
}

function groupSimulation(group, groupName){
    const table = [];
    const games = [];

    for(let i = 0; i < group.length; i ++){
        const row = {
            team : group[i],
            won: 0,
            lost: 0,
            score: 0,
            givenPoints: 0,
            takenPoints: 0,
            diffPoints: function(){
                return this.givenPoints - this.takenPoints;
            }
        };

        table.push(row);
    }

    for(let i = 0; i < group.length; i++){
        for(let j = i + 1; j < group.length; j++){
            const gameResult = gameSimulation(group[i], group[j]);
            games.push(gameResult);

            // CAN-AUS, CAN-GRC, CAN-SPA, AUS-GRC, AUS-SPA, GRC-SPA
            
            if(group[i] == gameResult.winTeam){//teamA je pobedio
                table[i].won++;
                table[i].score += 2;
                table[i].givenPoints += gameResult.firstTeamPoints;
                table[i].takenPoints += gameResult.secondTeamPoints;

                table[j].lost++;
                table[j].score += 1;
                table[j].givenPoints += gameResult.secondTeamPoints;
                table[j].takenPoints += gameResult.firstTeamPoints;
            }
            else{
                table[j].won++;
                table[j].score += 2;
                table[j].givenPoints += gameResult.secondTeamPoints;
                table[j].takenPoints += gameResult.firstTeamPoints;

                table[i].lost++;
                table[i].score += 1;
                table[i].givenPoints += gameResult.firstTeamPoints;
                table[i].takenPoints += gameResult.secondTeamPoints;
            }
        }
    }

    console.log(`Grupa ${groupName}:`)
    for(let i = 0; i < games.length / 2; i++){
        console.log(`   Grupna faza - ${i + 1} kolo:`);
        console.log(`       ${games[i].firstTeam.Team} - ${games[i].secondTeam.Team} (${games[i].firstTeamPoints} - ${games[i].secondTeamPoints})`);
        console.log(`       ${games[games.length - (i + 1)].firstTeam.Team} - ${games[games.length - (i + 1)].secondTeam.Team} (${games[games.length - (i + 1)].firstTeamPoints} - ${games[games.length - (i + 1)].secondTeamPoints})`);
    }

    table.sort(function(rowX, rowY){
        if(rowX.score > rowY.score){
            return -1; // -1 -> scoreA je veci
        }

        if(rowX.score < rowY.score){
            return 1;
        }

        const allGamesOfOneTeam = games.filter(game => game.firstTeam == rowX.team || game.secondTeam == rowX.team);

        const gameBetweenXY = allGamesOfOneTeam.filter(game => game.firstTeam == rowY.team || game.secondTeam == rowY.team);

        if(rowX.team == gameBetweenXY.winTeam){//x je bolji
            return -1;
        }

        if(rowY.team == gameBetweenXY.winTeam){
            return 1;
        }

        return 0;
    });

    return table;
}

console.log(groupSimulation(groups.A, 'A'));
