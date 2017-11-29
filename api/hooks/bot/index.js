/**
 * Module dependencies
 */

var Gitter = require('node-gitter');

/**
 * custom hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function BotHook(sails) {

  return {

    /**
     * Runs when a Sails app loads/lifts.
     *
     * @param {Function} done
     */
    initialize: async function (done) {

      sails.after(['hook:services:loaded', 'hook:orm:loaded'], () => {

        sails.hooks.bot.connections.gitter = new Gitter(sails.config.gitter.token);

        sails.hooks.bot.connections.gitter.rooms.join('Bitcoin-Cash-Fund/Lobby')
        .then((room) => {
          console.log('Joined room: ', room.name);
          return done();
        })
        .fail((err) => {
          console.log('Ruh roh:',err);
          return done();
        })

      });

    },
    connections: {
      gitter: undefined,
      github: undefined
    }

  };

};
