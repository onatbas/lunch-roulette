
module.exports.policies = {
   '*': true,
  'ActionController': {
    '/invite': 'isAuthenticated',
    '/createinvite': 'isAuthenticated'
  },

};
