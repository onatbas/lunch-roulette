var passport = require('passport');
var teamService = require('../services/TeamService');

module.exports = {
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },

    login: function (req, res, next) {
        if (req.isAuthenticated())
            res.redirect('/');
        else
            passport.authenticate('slack')(req, res, next);
    },

    logout: function (req, res) {
        req.logout();
        res.redirect('/');
    },

    success: function (req, res, next) {
        if (req.isAuthenticated())
            res.redirect('http://onat.me/lunchroulette');
        else {
            console.log('callback');
            passport.authenticate('slack', { successRedirect: 'http://onat.me/lunchroulette'})(req, res, next);
        }
    }
};
