const groups = require('./groups.json'); //Read from JSON file

const teams = [...groups.A, ...groups.B, ...groups.C];

const maxRank = Math.max(...teams.map(team => team.FIBARanking)); //Highest rank of all teams. Used in probability calculation.

/*
    Returns probability of win for teamA against teamB.
*/
function probabilityOfWin (rankingA, rankingB, maxRanking) {
    return (0.5 + ((Math.abs(rankingA - rankingB)) / maxRanking) / 2) * 100;
}

/*
    Returns points for winning and losing teams.
*/
function generateGamePoints(){
    const winningTeamPoints = Math.round(Math.random() * (100 - 50) + 50);
    const losingTeamPoints = Math.round(Math.random() * (winningTeamPoints - 1 - (winningTeamPoints - 30)) + (winningTeamPoints - 30));

    return { winningTeamPoints, losingTeamPoints };
}

/*
    Simulates game. Determines which teams will win/lose and their points.
*/
function gameSimulation (firstTeam, secondTeam) {
    const result = {
        winTeam: null,
        loseTeam: null,
        firstTeam: firstTeam,
        secondTeam: secondTeam,
        firstTeamPoints: 0,
        secondTeamPoints: 0
    };

    const probabilityA = probabilityOfWin (firstTeam.FIBARanking, secondTeam.FIBARanking, maxRank); //Chance for teamA

    const randomNumberProbability = Math.random() * 100;

    const gamePoints = generateGamePoints();

    if(probabilityA >= randomNumberProbability){ //TeamA has won
        result.winTeam = firstTeam;
        result.loseTeam = secondTeam;
        result.firstTeamPoints = gamePoints.winningTeamPoints;
        result.secondTeamPoints = gamePoints.losingTeamPoints;
    }else{
        result.winTeam = secondTeam;
        result.loseTeam = firstTeam;
        result.secondTeamPoints = gamePoints.winningTeamPoints;
        result.firstTeamPoints = gamePoints.losingTeamPoints;
    }

    return result;
}

/*
    Simulates tournament group phase. Create table which contains details.
*/
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

    for(let i = 0; i < group.length; i++){ //Simulate all games for group
        for(let j = i + 1; j < group.length; j++){
            const gameResult = gameSimulation(group[i], group[j]);
            games.push(gameResult);

            // CAN-AUS, CAN-GRC, CAN-SPA, AUS-GRC, AUS-SPA, GRC-SPA
            
            if(group[i] == gameResult.winTeam){
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

    console.log(`\nGrupa ${groupName}:`)
    for(let i = 0; i < games.length / 2; i++){
        console.log(`   Grupna faza - ${i + 1} kolo:`);
        console.log(`       ${games[i].firstTeam.Team} - ${games[i].secondTeam.Team} (${games[i].firstTeamPoints} : ${games[i].secondTeamPoints})`);
        console.log(`       ${games[games.length - (i + 1)].firstTeam.Team} - ${games[games.length - (i + 1)].secondTeam.Team} (${games[games.length - (i + 1)].firstTeamPoints} : ${games[games.length - (i + 1)].secondTeamPoints})`);
    }

    table.sort(function(rowX, rowY){
        if(rowX.score > rowY.score){
            return -1; // -1 -> ScoreX is higher
        }

        if(rowX.score < rowY.score){
            return 1;
        }

        const allGamesOfOneTeam = games.filter(game => game.firstTeam == rowX.team || game.secondTeam == rowX.team);

        const gameBetweenXY = allGamesOfOneTeam.filter(game => game.firstTeam == rowY.team || game.secondTeam == rowY.team);

        if(rowX.team == gameBetweenXY.winTeam){ //teamX is better
            return -1;
        }

        if(rowY.team == gameBetweenXY.winTeam){
            return 1;
        }

        return 0;
    });

    return  { table, games };
}

function printTable(table, groupName){
    console.log(`\n   Grupa ${groupName} (Ime - pobede/porazi/bodovi/postignuti koševi/primljeni koševi/koš razlika)`);
    for(let i = 0; i < table.length; i++){
        console.log(`       ${i + 1}. ${table[i].team.Team}     ${table[i].won} / ${table[i].lost} / ${table[i].score} / ${table[i].givenPoints} / ${table[i].takenPoints} / ${table[i].diffPoints()}`)
    }
}
/*
    Used when ranking teams.
*/
function sortPlacedTeams(teamX, teamY){
    if(teamX.score > teamY.score){
        return -1;
    }

    if(teamX.score < teamY.score){
        return 1;
    }

    if(teamX.diffPoints() > teamY.diffPoints()){
        return -1;
    }

    if(teamX.diffPoints() < teamY.diffPoints()){
        return 1;
    }

    if(teamX.givenPoints > teamY.givenPoints){
        return -1;
    }

    if(teamX.givenPoints < teamY.givenPoints){
        return 1;
    }

    return 0;
}

/*
    Represents hat drawing and returns teams which play together next to each other.
*/
function hatDraw(hatX, hatY, allGames){
    let gameBetweenXY = [];
    let gameBetweenZW = [];
    let quarterFinal = [];
    let teamHatX;
    let teamHatY;
    let teamHatZ;
    let teamHatW;

    do{
        teamHatX = hatX[Math.floor(Math.random()*hatX.length)];
        teamHatY = hatY[Math.floor(Math.random()*hatY.length)];

        if(hatX[0] == teamHatX){
            teamHatZ = hatX[1];
        }else{
            teamHatZ = hatX[0];
        }
    
        if(hatY[0] == teamHatY){
            teamHatW = hatY[1];
        }else{
            teamHatW = hatY[0];
        }
        
        const allGamesOfTeamHatX = allGames.filter(game => game.firstTeam == teamHatX || game.secondTeam == teamHatX);

        gameBetweenXY = allGamesOfTeamHatX.filter(game => game.firstTeam == teamHatY || game.secondTeam == teamHatY);

        const allGamesOfTeamHatZ = allGames.filter(game => game.firstTeam == teamHatZ || game.secondTeam == teamHatZ);

        gameBetweenZW = allGamesOfTeamHatZ.filter(game => game.firstTeam == teamHatW || game.secondTeam == teamHatW);

    }while(gameBetweenXY.length > 0 || gameBetweenZW.length > 0);

    quarterFinal.push(teamHatX, teamHatY, teamHatZ, teamHatW);

    return quarterFinal;
}

function printHat(hat, hatName){
    console.log(`   Sesir ${hatName}`)
    console.log(`       ${hat[0].Team}`)
    console.log(`       ${hat[1].Team}`)
}

/*
    Simulates a tournament. Determines placement of teams
*/
function tournamentSimulation(groups){
    //group phase
    const tableGroupA = groupSimulation(groups.A, 'A');
    const tableGroupB = groupSimulation(groups.B, 'B');
    const tableGroupC = groupSimulation(groups.C, 'C');

    const allGames = [...tableGroupA.games, ...tableGroupB.games, ...tableGroupC.games];

    console.log("\nKonacan plasman u grupama:");
    printTable(tableGroupA.table, 'A');
    printTable(tableGroupB.table, 'B');
    printTable(tableGroupC.table, 'C');

    //ranking
    const firstPlaced = [tableGroupA.table[0], tableGroupB.table[0], tableGroupC.table[0]];
    const secondPlaced = [tableGroupA.table[1], tableGroupB.table[1], tableGroupC.table[1]];
    const thirdPlaced = [tableGroupA.table[2], tableGroupB.table[2], tableGroupC.table[2]];

    firstPlaced.sort(sortPlacedTeams);
    secondPlaced.sort(sortPlacedTeams);
    thirdPlaced.sort(sortPlacedTeams);

    const hatD = [firstPlaced[0].team, firstPlaced[1].team];
    const hatE = [firstPlaced[2].team, secondPlaced[0].team];
    const hatF = [secondPlaced[1].team, secondPlaced[2].team];
    const hatG = [thirdPlaced[0].team, thirdPlaced[1].team];

    console.log("Sesiri: ");
    printHat(hatD, 'D');
    printHat(hatE, 'E');
    printHat(hatF, 'F');
    printHat(hatG, 'G');

    const quarterFinalTeams = [...hatDraw(hatD, hatG, allGames), ...hatDraw(hatE, hatF, allGames)]; // [D, G, D, G, E, F, E, F]

    console.log("\nEliminaciona faza:");
    for(let i = 0; i < quarterFinalTeams.length; i += 2){
        console.log(`   ${quarterFinalTeams[i].Team} - ${quarterFinalTeams[i + 1].Team}`);
    }

    const semiFinalTeams = []; // [D, D, F, E]

    //quarterfinals
    console.log("\nCetvrtfinale:");
    for(let i = 0; i < quarterFinalTeams.length; i += 2){
        const quarterGame = gameSimulation(quarterFinalTeams[i], quarterFinalTeams[i + 1]);
        semiFinalTeams.push(quarterGame.winTeam);

        console.log(`   ${quarterGame.firstTeam.Team} - ${quarterGame.secondTeam.Team} (${quarterGame.firstTeamPoints} : ${quarterGame.secondTeamPoints})`);
    }

    //semifinals
    const semiFinalGameX = gameSimulation(semiFinalTeams[0], semiFinalTeams[2]);
    const semiFinalGameY = gameSimulation(semiFinalTeams[1], semiFinalTeams[3]);
    console.log("\nPolufinale:");
    console.log(`   ${semiFinalGameX.firstTeam.Team} - ${semiFinalGameX.secondTeam.Team} (${semiFinalGameX.firstTeamPoints} : ${semiFinalGameX.secondTeamPoints})`);
    console.log(`   ${semiFinalGameY.firstTeam.Team} - ${semiFinalGameY.secondTeam.Team} (${semiFinalGameY.firstTeamPoints} : ${semiFinalGameY.secondTeamPoints})`);

    //third place
    const thirdPlaceGame = gameSimulation(semiFinalGameX.loseTeam, semiFinalGameY.loseTeam);
    console.log("\nUtakmica za trece mesto:");
    console.log(`   ${thirdPlaceGame.firstTeam.Team} - ${thirdPlaceGame.secondTeam.Team} (${thirdPlaceGame.firstTeamPoints} : ${thirdPlaceGame.secondTeamPoints})`);

    //final
    const finalGame = gameSimulation(semiFinalGameX.winTeam, semiFinalGameY.winTeam);
    console.log("\nFinale:");
    console.log(`   ${finalGame.firstTeam.Team} - ${finalGame.secondTeam.Team} (${finalGame.firstTeamPoints} : ${finalGame.secondTeamPoints})`);

    console.log("\nMedalje:");
    console.log(`   1. ${finalGame.winTeam.Team}`);
    console.log(`   2. ${finalGame.loseTeam.Team}`);
    console.log(`   3. ${thirdPlaceGame.winTeam.Team}`);
}

tournamentSimulation(groups);
