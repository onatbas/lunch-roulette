var sails = require('sails');

function getTeamById(id) {
    return new Promise(function (resolve) {
        sails.models.team.findOne({ id: id }).then(function (result) {
            resolve(result);
        });
    });
}

function GetOrCreate(team) {
    return new Promise((resolve, reject) => {
        Team.findOne(team.id).then((teamvo) => {
            if (!teamvo)
                Team.create(team).exec((err, teamvo) => {
                    if (err)
                        reject(err);
                    else
                        resolve(teamvo);
                });
            else {
                resolve(teamvo);
            }
        });
    });
}

module.exports = {
    getTeamById: getTeamById,
    GetOrCreate: GetOrCreate
}