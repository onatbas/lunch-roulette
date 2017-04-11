/**
 * ActionController
 *
 * @description :: Server-side logic for managing actions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var slack = require('../services/SlackService');
var userService = require('../services/UserService');
var teamService = require('../services/TeamService');
var rouletteService = require('../services/RouletteService');


function UserBoarded(payload, req, res) {
    var user = {
        id: payload.user.id,
        name: payload.user.name,
        team: payload.team.id
    };
    Promise.all([
        userService.GetOrCreate(user)
    ]).then((results) => {
        var user = results[0];

        var rouletteId = payload.callback_id.replace('boarded-', '');
        user.roulettes.add(rouletteId);

        user.save((err) => {
            if (err)
                res.status(500).send({ text: "Oops.." + JSON.stringify(err) });
            else {

                rouletteService.GetRouletteById(rouletteId).then((roulettevo) => {
                    roulettevo.users.add(user.id);
                        roulettevo.save((err) => {
                    teamService.getTeamById(user.team).then((teamvo) => {
                            slack.SendIM(teamvo.token, user.id, 'Allright! We\'ll notify you when it spins! (' + payload.original_message.attachments[0].text + ')').then((result) => {
                                res.send(payload.original_message);
                            });
                        });
                    });

                });
            }
        });
    });
}

function NewRoulette(payload, req, res) {

    console.log('New roulette request.');
    var rouletteId = payload.callback_id.replace('newroulette-', '');
    var dateInformation = JSON.parse(rouletteId);
    console.log(rouletteId);

    var body = {
        message: dateInformation.message,
        day: dateInformation.day,
        hour: parseInt(dateInformation.hour.split(':')[0]),
        minute: parseInt(dateInformation.hour.split(':')[1]),
        recurring: payload.actions[0].value,
        team: payload.team.id,
        offset: 0 // SET LATER IN PROMISE 
    };

    console.log('Getting information from db ' + JSON.stringify(body));
    teamService.getTeamById(body.team).then((team) => {

      slack.getTimeZoneOffset(team.token, payload.user.id).then((offset)=>{
        body.offset = offset;
        console.log('team here ' + JSON.stringify(team));
        rouletteService.GetOrCreate(body).then((roulette) => {
            console.log('results' + JSON.stringify(roulette));
            console.log('sending invite');
            console.log(JSON.stringify({ team: team, roulette: roulette }));
            slack.sendInvite(roulette, team).then((response) => {
                console.log('New roulette request sent to slack. Response.' + JSON.stringify(response));
                res.send(response);
                console.log('Reqeuest returned');

            });
        });
    });
      });
}

module.exports = {
    action: function (req, res) {
        var payload = JSON.parse(req.body.payload);
        if (payload.callback_id.search(/boarded-/i) >= 0)
            UserBoarded(payload, req, res);
        else if (payload.callback_id.search(/newroulette-/i) >= 0)
            NewRoulette(payload, req, res);
    },
    actionext: function (req, res) {
        res.send('ok');
    },

    create: function (req, res) {
        var text = req.body.text;
        var parameters = text.split(' ');


        //check if enough parameters are passed or not.
        if (parameters.length < 3) { res.send("Not enough paramaters. Please use [location] [day] [hour] format."); return; }

        var message = '';
        for (var i = 0; i < parameters.length - 2; i++)
            message += parameters[i] + ' ';

        var body = {
            message: message,
            day: parameters[parameters.length - 2].toLowerCase(),
            hour: parameters[parameters.length - 1]
        }

        //check if hour is nicely formatted.
        var hour = body.hour.split(':');
        if (hour.length !== 2) { res.send("Broken hour format. Use something like \"14:30\""); return; }
        hour[0] = parseInt(hour[0]);
        hour[1] = parseInt(hour[1]);
        if (hour[0] > 23 || hour[0] < 0) { res.send("Invalid hour. Please use 24Hr formatting."); return; }
        if (hour[1] > 59 || hour[1] < 0) { res.send("Invalid hour. Please use 24Hr formatting."); return; }


        //check day format.
        switch (body.day) {
            case 'monday':
            case 'tuesday':
            case 'wednesday':
            case 'thursday':
            case 'friday':
            case 'saturday':
            case 'sunday':
                break;
            default:
                res.send("Invalid day. Options are: [\'monday\', \'tuesday\', \'wednesday\', \'thursday\', \'friday\', \'saturday\', \'sunday\']");
                return;
        }

        res.send({
            "attachments": [
                {
                    "text": "Do you want this to be a recurring event?",
                    "attachment_type": "default",
                    "callback_id": "newroulette-" + JSON.stringify(body),
                    "actions": [
                        {
                            "name": "spin",
                            "text": "No",
                            "type": "button",
                            "value": "0"
                        },
                        {
                            "name": "spin",
                            "text": "Every week-day",
                            "type": "button",
                            "value": "ewd"
                        },
                        {
                            "name": "spin",
                            "text": "Every week",
                            "type": "button",
                            "value": "ew"
                        },/*
                        {
                            "name": "spin",
                            "text": "Every second week",
                            "type": "button",
                            "value": "esw"
                        },*/
                        {
                            "name": "spin",
                            "text": "Every month",
                            "type": "button",
                            "value": "em"
                        }
                    ]
                }
            ]
        });
    }

};

