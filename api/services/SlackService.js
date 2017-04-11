var request = require("request");
var rouletteService = require('../services/RouletteService');

function sendViaWebhook(team, body) {

    return new Promise((resolve, reject) => {
        var options = {
            method: 'POST',
            url: team.webhook,
            headers:
            {
                'content-type': 'application/json'
            },
            body: body,
            json: true
        };
        request(options, function (error, response, body) {
            if (error) reject(error)
            else resolve(body);
        });
    });
}

function SendToChannel(token, channel, message) {
    return new Promise((resolve, reject) => {
        
        var options = {
            method: 'POST',
            url: 'https://slack.com/api/chat.postMessage',
            headers: { 'content-type': 'multipart/form-data;' },
            formData:
            { token: token, channel: channel, text: message }
        };
        request(options, function (error, response, body) {
            if (error) reject(error);
            else resolve(body);
        });
    });
}
function getTimeZoneOffset(token, userId) {
    return new Promise((resolve, reject) => {

        
        var options = {
            method: 'POST',
            url: 'https://slack.com/api/users.list',
            headers: { 'content-type': 'multipart/form-data;' },
            formData: { token: token }
        };
        request(options, function (error, response, body) {
            if (error) reject(error);
            else {
                var found = {};
                JSON.parse(body).members.forEach(function (member) {
                    if (member.id === userId)
                        found = member;
                }, this);
                if (!found) resolve(0);
                else {
                    resolve(parseInt(found.tz_offset) / 3600);
                }
            }
        });
    });
}


function getAvatarsOfPeople(token) {
    return new Promise((resolve, reject) => {

        
        var options = {
            method: 'POST',
            url: 'https://slack.com/api/users.list',
            headers: { 'content-type': 'multipart/form-data;' },
            formData: { token: token }
        };

        var avatarMap = {};
        request(options, function (error, response, body) {
            if (error) reject(error);
            else {
                var found = {};
                JSON.parse(body).members.forEach(function (member) {
                 avatarMap[member.id] = member.profile.image_72;
                }, this);
                resolve(avatarMap);
            }
        });
    });
}


function SendIM(token, user, message) {

    return new Promise((resolve, reject) => {
        
        var options = {
            method: 'POST',
            url: 'https://slack.com/api/im.open',
            headers: { 'content-type': 'multipart/form-data;' },
            formData: { token: token, user: user }
        };
        request(options, function (error, response, body) {
            if (error) reject(error);
            var payload = JSON.parse(body);
            var channelID = payload.channel.id;
            SendToChannel(token, channelID, message).then((result) => resolve(result));
        });
    });
}

function buildMessage(roulette) {
    var message = roulette.message + ' @ ';
    var capitalizedday = roulette.day.charAt(0).toUpperCase() + roulette.day.slice(1);
    switch (roulette.recurring) {
        case '0': message += capitalizedday + ', '; break;
        case 'ewd': message += 'Every day, '; break;
        case 'ew': message += 'Every week on ' + capitalizedday + 's, '; break;
        case 'esw': message += 'Every second week on ' + capitalizedday + 's, '; break;
        case 'em': message += 'Every month, this day '; break;
    }
    message += roulette.hour + ':' + roulette.minute;
    return message;
}

function sendInvite(roulette, team) {
    return sendViaWebhook(team,
        {
            text: 'A new lunch roulette added!',
            attachments:
            [{
                text: buildMessage(roulette),
                fallback: 'ama o oyle olmuyo işte',
                callback_id: 'boarded-' + roulette.id,
                color: '#3AC3E3',
                attachment_type: 'default',
                actions: [{ name: 'spin', text: 'Hop in!', type: 'button', value: 'yes' }]
            }]
        });
}
module.exports = {
    sendInvite: sendInvite,
    SendIM: SendIM,
    getTimeZoneOffset: getTimeZoneOffset,
    sendViaWebhook: sendViaWebhook,
    getAvatarsOfPeople: getAvatarsOfPeople,
    buildMessage: buildMessage
}