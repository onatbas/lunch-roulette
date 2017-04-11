var sails = require('sails');
var slackService = require('../api/services/SlackService');
var schedule = require('node-schedule');


function NotifyChannelOnResult(team, chosen, roulette) {
    var body = {
        text: "Results for \"" + slackService.buildMessage(roulette) + "\" are in!",
        attachments: []
    }

    slackService.getAvatarsOfPeople(team.token).then((avatars) => {

        var promises = [];

        chosen.forEach(function (user) {
            body.attachments.push(
                {
                    "color": "#36a64f",
                    "image_url": avatars[user.id],
                    "author_name": user.name
                });

            promises.push(slackService.SendIM(team.token, user.id, "You've been selected as one of the participants to " + slackService.buildMessage(roulette) + ". Don't be late!"));
        }, this);

        promises.push(slackService.sendViaWebhook(team, body));
        return Promise.all(promises);
    });
    
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


function dayNameToCount(dayString) {
    switch (dayString) {
        case 'monday': return 1;
        case 'tuesday': return 2;
        case 'wednesday': return 3;
        case 'thursday': return 4;
        case 'friday': return 6;
        case 'saturday': return 7;

    }
}

function isTodayTheDay(time, day) {
    return (dayNameToCount(day) === time.getUTCDay());
}

module.exports = {
    beginTasks: function () {
        var j = schedule.scheduleJob('1 * * * * *', function () {


            var currentTime = new Date();
            Roulette.find().populate('users').populate('team').then((allRoulettes) => {

                allRoulettes.forEach(function (element) {

                    var deleteLater = false;

                    // Check day.
                    switch (element.recurring) {
                        case 'ewd': break; // 
                        case '0': deleteLater = true; break;
                        default:
                            if (!isTodayTheDay(currentTime, element.day))
                                return; //terminate;
                    }

                    //Check hour.
                    var spinBeforeHours = 3;
                    var correctHour = currentTime.getUTCHours() + parseInt(element.offset);
                    if (correctHour === parseInt(element.hour) - spinBeforeHours) {
                        if (currentTime.getUTCMinutes() === parseInt(element.minute)) {
                            // We're on!!! 

                            var attendees = shuffle(element.users);
                            var chosen = [];
                            if (attendees.length <= 4)
                                chosen = attendees;
                            else {
                                for (var i = 0; i < 4; i++)
                                    chosen.push(attendees[i]);
                            }

                         //   if (chosen.length>3)
                                NotifyChannelOnResult(element.team, chosen, element);
                            if (deleteLater)
                                    element.destroy();
                        }
                    }

                }, this);

            });


        });
    }
}