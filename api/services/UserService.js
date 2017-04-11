var sails = require('sails');

function GetOrCreate(user) {
    return new Promise(function (resolve, reject) {

        sails.models.user.findOne({ id: user.id }).then((uservo) => {
            if (uservo)
                resolve(uservo);
            else {
                sails.models.user.create(user).exec((err, uservo) => {
                    if (err)
                        reject(err);
                    else
                        resolve(uservo);
                });
            }
        });
    });
}


module.exports = {
    GetOrCreate: GetOrCreate
}