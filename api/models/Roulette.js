/**
 * Roulette.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var uuid = require('node-uuid');


module.exports = {

  attributes: {

    id: {
      type: 'string', required: true, 
      primaryKey: true,
      defaultsTo: function () { return uuid.v4(); }, 
      uuidv4: true, 
      unique: true
    },
      message: {type: 'string', required: true},
      day: {type: 'string', required: true, enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']},
      hour: {type: 'int', required: true},
      minute: {type: 'int', required: true},
      offset: {type: 'int', required: true},
      team: { model: 'team', required: true },
      users: {collection: 'user', via: 'roulettes'},
      recurring: { type: 'string', enum: ['0', 'ewd', 'ew', 'esw', 'em'], required: true }
  }
};

