var sails = require('sails');
var teamService = require('./TeamService');


function GetRouletteById(rouletteID)
{
    return Roulette.findOne({id: rouletteID}).populate('users');
}

function GetOrCreate(roulette) {
    return new Promise(function (resolve, reject) {
        console.log('Getting roulette from information' + JSON.stringify(roulette));
        Roulette.create(roulette).exec(function (err, roulettevo) {
            console.log('Create called. ' + JSON.stringify({ err: err, roulettevo: roulettevo }));
            if (err) {

                console.log('rejecting.');
                reject(err);
            }
            else {
                resolve(roulettevo);

                //       console.log('Roulette created. Now adding to the team.');
                //        var team = teamService.getTeamById(roulettevo.team).then((teamvo) => {
                // console.log('got team from  team id' + JSON.stringify(teamvo));
                //                  teamvo.roulettes.add(roulettevo.id);

                //  console.log('Added roulette id to team' + JSON.stringify(teamvo) + '..saving..');
                //             teamvo.save((err) => {
                //                console.log(JSON.stringify(err));
                //               if (err) reject(err);
                //              else resolve(roulettevo);
                //         });

                //     });
            }
        });
    });
}


module.exports = {
    GetOrCreate: GetOrCreate,
    GetRouletteById: GetRouletteById
}