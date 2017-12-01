/**
 * Module dependencies
 */

var Gitter = require('node-gitter');

var request = require('request');
var j = request.jar();
var cheerio = require('cheerio');
var _ = require('lodash');
var async = require('async');

/**
 * custom hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function GithubHook(sails) {

  return {

    /**
     * Runs when a Sails app loads/lifts.
     *
     * @param {Function} done
     */
     initialize: function (done) {

      // Copied from the Bot hook.  Currently just the stubb.  Will build later.
      return done();

      sails.after(['hook:services:loaded', 'hook:orm:loaded'], async function () {

        // Check for existing tokens in the database before we fetch new ones

        var gitterOauthToken = await Token.findOne({ serviceName: 'gitter' });


        if (gitterOauthToken && gitterOauthToken.tokenExpires > new Date() ) {
          console.log('We have a token',gitterOauthToken);
          sails.hooks.bot.connectGitter();
          return done();
        }
        else {
          console.log('Since theres no token, lets get one');
        }

        // Otherwise, fetch one and store it in the database
        async.auto({
          'prepareGithubLogin': function(next) {

            // Get hidden form fields for Github login
            request
            .defaults({jar:j})({
              url: 'https://github.com/login',
              method: 'GET'
            }, function(err, res, body) {
              if (err) {
                console.log('first err:',err);
                return next(err);
              }

              var $ = cheerio.load(body);
              // Return the form data so we can log into Github
              return next(null, {
                authenticity_token: $('input[name=authenticity_token]').val(),
                utf8: $('input[name=utf8]').val()
              });

            });

          },
          'doGithubLogin': ['prepareGithubLogin', function(results, next) {

            // Log into Github
            request
            .defaults({jar:j})
            .post({
              url: 'https://github.com/session',
              json: true,
              followAllRedirects: true,
              gzip: true,
              headers: {
                "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*;q=0.8",
                "accept-encoding":"gzip, deflate",
                "accept-language":"en-US,en;q=0.8",
                "cache-control":"no-cache",
                "content-type":"application/x-www-form-urlencoded",
                "Host":"github.com",
                "Origin":"https://github.com",
                "Pragma":"no-cache",
                "Referer":"https://github.com/",
                "upgrade-insecure-requests":"1",
                "user-agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36"
              },
              form: {
                commit: 'Sign in',
                login: sails.config.github.login,
                password: sails.config.github.password,
                authenticity_token: results.prepareGithubLogin.authenticity_token,
                utf8: results.prepareGithubLogin.utf8
              }
            }, function(err, res, body) {
              if (err){
                return next(err);
              }

              return next(null, body);
            });

          }],
          'pickGitterLoginMethod': ['doGithubLogin', function(results, next) {

            // Select "Sign in using Github" for Gitter login
            request
            .defaults({jar:j})({
              url: 'https://gitter.im/login/github?action=login&source=login_page-login',
              followAllRedirects: true,
              method: 'GET'
            }, function(err, res, body) {

              if (err) {
                return next(err);
              }

              // If too frequently refesh authorization tokens, they cut us off
              // TODO: find a more graceful solution to this problem.
              if (body.indexOf('unusually high number of requests') > -1) {
                console.log('ERRRROR.  We need to reauthorize the app in Gitter!');
                process.exit(0);
              }

              return next(null,body);
            });

          }],
          'doGitterLogin': ['pickGitterLoginMethod', function(results, next) {
            // Log into Gitter
            request
            .defaults({jar:j})({
              url: 'https://gitter.im/login/oauth/authorize?response_type=code&redirect_uri='+sails.config.gitter.redirectUrl+'&client_id='+sails.config.gitter.key,
              followAllRedirects: true,
              method: 'GET'
            }, function(err, res, body) {

              if (err) {
                return next(err);
              }

              var $ = cheerio.load(body);

              return next(null, {
                transaction_id: $('input[name=transaction_id]').val()
              });
            });

          }],
          'githubLogout': ['doGitterLogin', function(results, next) {

            request
            .defaults({jar:j})
            .post({
              url: 'https://github.com/logout',
              followAllRedirects: true,
              form: results.prepareGithubLogin
            }, function(err, res, body) {
              if (err) {
                console.log('second err:',err);
                return next(err);
              }

              return next();
            });
          }]
        }, function(err, results) {
          if (err) {
            console.log('Oh noes.  An error!',err);
          }

          // After the app is lifted, get the oauth decision
          sails.on(['lifted'], function () {
            request
            .defaults({jar:j})
            .post({
              url: 'https://gitter.im/login/oauth/authorize/decision',
              json:true,
              followAllRedirects: true,
              gzip: true,
              headers: {
                "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*;q=0.8",
                "accept-encoding":"gzip, deflate",
                "accept-language":"en-US,en;q=0.8",
                "cache-control":"no-cache",
                "content-type":"application/x-www-form-urlencoded",
                "Host":"gitter.im",
                "Origin":"https://gitter.im",
                "Referer":"https://gitter.im/login/oauth/authorize?response_type=code&redirect_uri="+sails.config.gitter.redirectUrl+"&client_id="+sails.config.gitter.key,
                "Pragma":"no-cache",
                "upgrade-insecure-requests":"1",
                "user-agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36"
              },
              form: results.doGitterLogin
            }, function(err, res, body) {

              if (err) {
                console.log('third err:',err);
                return done(err);
              }

            });

          });

          // Allow the app to finish lifting.  The http router
          // must load before we request the oauth token or else
          // the oauth redirect will fail.
          done();

        });

      });
    },
    routes: {

      before: {
        '/oauth/git': {
          skipAssets: true,
          fn: async function(req, res, next){
            var code = req.param('code');

            request.post({
              url: 'https://gitter.im/login/oauth/token',
              json:true,
              followAllRedirects: true,
              gzip: true,
              form: {
                'client_id': sails.config.gitter.key,
                'client_secret': sails.config.gitter.secret,
                'code': code,
                'redirect_uri': sails.config.gitter.redirectUrl,
                'grant_type': 'authorization_code'
              }
            }, async function(err, res, body) {
              if (err) {
                console.log('fourth err:',err);
                return done(err);
              }

              // Update the Oauth token in the database
              // then have the Gitter Bot connect!
              var token = await Token.findOne({ serviceName: 'gitter' })

              if (!token) {
                console.log('since no token, making one:');
                token = await Token.create({ serviceName: 'gitter', tokenValue: body&&body.access_token, tokenExpires: new Date(new Date().getTime()+1000*3600*24*3) }).fetch();
              }

              console.log('We have a token for sure.  Connecting to Gitter:',token);


              // Now that we have an oauth token, tell
              // the Gitter bot to connect to our room.
              return sails.hooks.bot.connectGitter();

            });

            // Send an okay response while we're waiting 
            // on our shiny new oauth token.
            res.ok();

          }
        }
      }
    }  };

};
