/**
 * Module dependencies
 */
var request = require('request');
var j = request.jar();
var cheerio = require('cheerio');
var _ = require('lodash');
var async = require('async');
var jwt = require('jsonwebtoken');

/**
 * custom hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */


var githubHook = function(sails) {

  return {

    /**
     * Runs when a Sails app loads/lifts.
     *
     * @param {Function} done
     */
     initialize: function (done) {

      return done();

    },
    authAsInstallation: function() {

      var token = jwt.sign({
        iat: require('moment')().unix(),
        exp: require('moment')().unix()+60*9,
        iss: 7157
      }, sails.config.github.app.pem, { algorithm: 'RS256'});

      var requestOptions = {
        url: 'https://api.github.com/installations/'+7157+'/access_tokens',
        headers: {
          'Authorization': 'Bearer '+token,
          'Accept': 'application/vnd.github.machine-man-preview+json',
          'User-Agent': sails.config.github.app.userAgent
        }
      };

      console.log('Requesting user info with:',requestOptions);

      request.post(requestOptions, async function(err, res, body) {
        if (err) {
          console.log('fourth err:',err);
          return done(err);
        }
        console.log('Got response after authenticating:',res.statusCode,body);

      });

    },
    forkRepo: function(oauthToken) {

      var requestOptions = {
        url: 'https://api.github.com/repos/bitcoin/bitcoin/forks',
        headers: {
          'Authorization': 'token '+oauthToken.access_token,
          'User-Agent': sails.config.github.app.userAgent
        }
      };

      request.post(requestOptions, async function(err, res, body) {
        if (err) {
          console.log('err:',err);
          return done(err);
        }
        console.log('Got response after authenticating:',res.statusCode,body);

      });

    },
    uploadFile: function(oauthToken) {

      var requestOptions = {
        url: 'https://api.github.com/repos/alwaysAn0n/FPRs/contents/an0nsBadassProposal.md',
        headers: {
          'Authorization': 'token '+oauthToken.access_token,
          'User-Agent': sails.config.github.app.userAgent
        },
        json: {
          message: 'This is totally gonna get funded',
          content: Buffer.from('Check out this awesome PR brah').toString('base64')
        }
      };

      request.put(requestOptions, async function(err, res, body) {
        if (err) {
          console.log('err:',err);
          return done(err);
        }
        console.log('Got response after authenticating:',res.statusCode,body);

      });


    },

    // Github Authentication Steps 
    // 
    // 1. User lands on info page containing link to start oauth process
    // 2. User follows link, logs in with Github, then is redirected to `/git/app/authorized` alone with an oauth CODE
    // 3. We hit `https://github.com/login/oauth/access_token` and get the user's code which can be traded for an oauth token.
    // 4. We use the oauth code to fetch oauth token.  Then we use the oauth token to fetch the user's github account info from 'https://github.com/user'
    // 5. We create a user record with their github information then redirect them to https://github.com/apps/consensusbot-dev
    // 6. User installs the app and is redirected to http://localhost:1337/git/app/installed which loads an `update profile` page populated with their github account data
    // 7. User confirms their account details and hits the submit button.  They are redirected to the FPR submission form.
    // 8. User submits the account signup form and is redirected to their profile page that links to the FPR submit form.


    routes: {

      before: {
        '/git/webhook': {
          skipAssets: true,
          fn: function(req, res, next){
            console.log('Got a webhook!');

            console.log('req.allParams()',req.body);
            return res.sendStatus(200);
          }
        },
        '/git/app/install': {
          skipAssets: true,
          fn: async function(req, res, next){
            console.log('Step 1: User initiates app authorization!');

            return res.view('pages/github/install', {
              beginInstallLink: 'http://github.com/login/oauth/authorize?client_id='+sails.config.github.app.clientId+'&redirect_uri='+sails.config.github.app.redirectUrl
            });

          }
        },
        '/git/app/authorized': {
          skipAssets: true,
          fn: function(req, res, next){
            console.log('Step 2: User has authorized us!', req.param('code'));

            request.post({
              url: 'https://github.com/login/oauth/access_token',
              json:true,
              followAllRedirects: true,
              gzip: true,
              form: {
                'client_id': sails.config.github.app.clientId,
                'client_secret': sails.config.github.app.clientSecret,
                'code': req.param('code')
              }
            }, function(err, response, body) {
              if (err) {
                console.log('fourth err:',err);
                return done(err);
              }
              console.log('Step 3: We exchanged the code for a token ',body);

              var githubOauthToken = body || {};

              var requestOptions = {
                url: 'https://api.github.com/user',
                json: true,
                headers: {
                  'Authorization': 'token '+githubOauthToken.access_token,
                  'User-Agent': sails.config.github.app.userAgent
                }
              };

              console.log('Step 4: Using access token to get Github User info!');

              request.get(requestOptions, async function(err, response, body) {
                if (err) {
                  console.log('fourth err:',err);
                  return done(err);
                }

                console.log('Step 5: Create user record in database', body);

                // Create a token record
                var token = await Token.create({
                  serviceName: 'githubUserOauth',
                  tokenValue: githubOauthToken.access_token,
                  tokenExpires: new Date(new Date().getTime()+1000*3600*24*10),
                }).fetch();

                console.log('Created token for user:',token);

                var githubUser = body || {};

                var user = await User.findOne({
                  githubLogin: githubUser.login
                }).populate('githubOauthToken');


                // If there is no user in the database associated
                // with this Github login, create one and associate
                // the oauth token with it.
                if (!user) {
                  user = await User.create({
                    githubLogin: githubUser.login,
                    signupComplete: false,
                    githubUserData: githubUser,
                    githubOauthToken: token.id
                  }).fetch();
                }

                // If the user does exist, just update their
                // github information and move on.
                else {
                  user = await User.update({id: user.id}, {
                    githubLogin: githubUser.login,
                    signupComplete: false,
                    githubUserData: githubUser,
                    githubOauthToken: token.id
                  }).fetch();
                }

                console.log('Step 6: Redirecting user to app install page after creating user',user);

                return res.redirect('https://github.com/apps/'+sails.config.github.app.userAgent);

              });

            });

          }
        },
        '/git/app/installed': {
          skipAssets: true,
          fn: async function(req, res, next){
            console.log('You did it!  Everything works!',req.allParams());

            // http://localhost:1337/git/app/installed?installation_id=71367

            return res.redirect('/form');
          }
        }
      }
    }  };

};

// Only run this hook if the hook if it's specified
// in the environment configuration
if (sails.config.hooks.github){
  console.log('Loading github hook.');
  module.exports = githubHook;
}
else {
  module.exports = function(){
    console.log('Skipping github hook.');
    return {};
  };
}
