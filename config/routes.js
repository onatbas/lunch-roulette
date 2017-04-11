
module.exports.routes = {

  '/': {
    view: 'homepage'
  },

  '/login': 'AuthController.login',
  '/success' : 'AuthController.success',
  '/action' : 'ActionController.action',
  '/actionext' : 'ActionController.actionext',
  '/createroulette': 'ActionController.create'

};