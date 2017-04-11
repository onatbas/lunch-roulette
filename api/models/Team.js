/**
 * Team.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	attributes: {
        name: {type: 'string', required: true},
        id: {type: 'string', required: true, primaryKey: true},
        roulettes : {collection: 'roulette', via: 'team'},
        webhook: {type: 'string', required: true},
        token: {type: 'string', required: true}

    }
};

