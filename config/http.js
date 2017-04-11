var passport = require('passport');
var SlackStrategy = require('passport-slack').Strategy;

var teamService = require('../api/services/TeamService');

var schedule = require('./schedule');
var cfconfig = require('./env/cfconfig');
var slack = cfconfig.getSlackObject();

var slackOptions = {
	clientID: slack.clientID,	
	clientSecret: slack.clientSecret,
	skipUserProfile: true,
	scope: ['bot users:read', 'im:write', 'commands', 'chat:write:bot', 'incoming-webhook'],
};


function verifyHandler(token, tokenSecret, params, profile, done) {
  process.nextTick(function () {
        var team = {
          id: params.team_id,
          name : params.team_name,
          webhook: params.incoming_webhook.url,
          token: token
        };

        teamService.GetOrCreate(team).then((team) => {
          done(null, team);
        });
      });
};


passport.serializeUser(function (team, done) {
  done(null, team.id);
});

passport.deserializeUser(function (id, done) {
  Team.findOne({ id: id }, function (err, team) {
    done(err, team);
  });
});




module.exports.http = {

 customMiddleware: function (app) {
    passport.use(new SlackStrategy(slackOptions, verifyHandler));
    app.use(passport.initialize());
    app.use(require('body-parser').urlencoded({ extended: true }));
    app.use(passport.session());
    
    schedule.beginTasks();
},

  middleware: {}
};
