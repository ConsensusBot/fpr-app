/**
 * Module dependencies
 */

// TODO: switch to request-promise
var request = require('request');

var j = request.jar();
var cheerio = require('cheerio');
var _ = require('lodash');
var async = require('async');
var GitHubApi = require('github')
var jwt = require('jsonwebtoken');

/**
 * custom hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

var githubHook = function(sails) {

  // TODO: remove this and all it's dependencies
  // 
  // var token = jwt.sign({
  //   iat: require('moment')().unix(),
  //   exp: require('moment')().unix()+60*9,
  //   iss: 7157
  // }, sails.config.github.app.pem, { algorithm: 'RS256'});

  return {
    testTing: async function(options) {

      var client = await sails.hooks.github.buildClientFromUser({id: 10});

      var userInfo = await client.users.get({});
      var userEmails = await client.users.getEmails({});

      console.log('User Info',userInfo);
      console.log('User Emails:',userEmails);

    },
    buildClientFromUser: async function (options) {
      console.log('Building client!');
      var user = await User.findOne(options).populate('githubOauthToken');

      if (!user.githubOauthToken) {
        console.log('No token associated with user!',options,user);
        return;
      }

      var client = new GitHubApi({
        headers: {
          'Authorization': 'Bearer '+user.githubOauthToken.tokenValue,
          'Accept': 'application/vnd.github.machine-man-preview+json',
          'User-Agent': sails.config.github.oauth.userAgent
          // 'User-Agent': sails.config.github.app.userAgent
        }
      });

      client.authenticate({
        type: 'oauth',
        token: user.githubOauthToken.tokenValue
      });

      return client;

    },
    /**
     * Runs when a Sails app loads/lifts.
     *
     * @param {Function} done
     */
     initialize: async function (done) {
      /*sails.after(['lifted'], async ()=>{

        var user = await User.findOne({githubLogin: 'ConsensusBot'}).populate('githubOauthToken');
        console.log('Authorizing with consensusBot oauth token:',user);

        console.log('using token with length',(token&&token.length), (sails.config.github.app.pem&&sails.config.github.app.pem.length));

        try {
          sails.client.authenticate({
            type: 'integration',
            token: token
          });
          console.log('Sucessfully authorized as an app!');
        }
        catch(authError) {
          console.log('Error authorizing:',authError);
        }

      });*/

      done();

    },
    // authAsInstallation: function() {

    //   var token = jwt.sign({
    //     iat: require('moment')().unix(),
    //     exp: require('moment')().unix()+60*9,
    //     iss: 7157
    //   }, sails.config.github.app.pem, { algorithm: 'RS256'});

    //   var requestOptions = {
    //     url: 'https://api.github.com/installations/'+7157+'/access_tokens',
    //     headers: {
    //       'Authorization': 'Bearer '+token,
    //       'Accept': 'application/vnd.github.machine-man-preview+json',
    //       'User-Agent': sails.config.github.app.userAgent
    //     }
    //   };

    //   console.log('Requesting user info with:',requestOptions);

    //   request.post(requestOptions, async function(err, res, body) {
    //     if (err) {
    //       console.log('fourth err:',err);
    //       return done(err);
    //     }
    //     console.log('Got response after authenticating:',res.statusCode,body);

    //   });

    // },
    forkRepo: function(oauthToken) {

      var requestOptions = {
        url: 'https://api.github.com/repos/bitcoin/bitcoin/forks',
        headers: {
          'Authorization': 'token '+oauthToken.access_token,
          'User-Agent': sails.config.github.app.userAgent
        }
      };

      // cbot.repos.fork({owner:'bitcoin',repo:'bitcoin'})

      request.post(requestOptions, async function(err, res, body) {
        if (err) {
          console.log('err:',err);
          return done(err);
        }
        console.log('Got response after authenticating:',res.statusCode,body);

      });

    },
    uploadFile: function(oauthToken) {
      // cbot.repos.createFile({owner: 'alwaysan0n',repo: 'bitcoin',path: 'myBadassFile.md',message: 'this is my new file yall',content: Buffer.from('Check out this awesome file brah').toString('base64')}).catch(console.log).then(console.log);

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
    // 1. User lands on home page and "logs in with Github"
    // 2. User approves the app for the requested permissions then is redirected to `/git/oauth/authorized` along with an oauth CODE
    // 3. We hit `https://github.com/login/oauth/access_token` and get the user's code which can be traded for an oauth token.
    // 4. We use the oauth code to fetch oauth token.  
    // 5. We use the oauth token to request the users email address and Github account info.
    // 6. At this point, if the user doesn't have an account with us, we create one, save his oauth token, then redirect him to the homepage. If they do have an account, we update the oauth token then redirect them to the homepage

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
        '/git/login': {
          skipAssets: true,
          fn: async function(req, res, next){
            console.log('Step 1: User initiates app authorization!');

            return res.view('pages/github/login', {
              beginInstallLink: 'http://github.com/login/oauth/authorize?scope=user,repo&client_id='+sails.config.github.oauth.clientId+'&redirect_uri='+sails.config.github.oauth.redirectUrl
            });

          }
        },
        '/git/oauth/authorized': {
          skipAssets: true,
          fn: function(req, res, next){
            console.log('Step 2: User has authorized us!', req.param('code'));

            request.post({
              url: 'https://github.com/login/oauth/access_token',
              json: true,
              followAllRedirects: true,
              gzip: true,
              form: {
                'client_id': sails.config.github.oauth.clientId,
                'client_secret': sails.config.github.oauth.clientSecret,
                'code': req.param('code')
              }
            }, async function(err, response, body) {
              if (err) {
                console.log('fourth err:',err);
                return done(err);
              }
              console.log('Step 3: We exchanged the code for a token ',body);

              var githubOauthToken = body || {};

              // Create an instance of our Github API client.
              var client = new GitHubApi({
                headers: {
                  'Authorization': 'Bearer '+githubOauthToken.access_token,
                  'Accept': 'application/vnd.github.machine-man-preview+json',
                  'User-Agent': sails.config.github.oauth.userAgent
                }
              });

              client.authenticate({
                type: 'oauth',
                token: githubOauthToken.access_token
              });

              // Get the user's Github information so we can 
              // bootstrap their profile with it
              console.log('Step 4: Using access token to get Github User info!');
              var githubUser = await client.users.get({}) || {};
              var githubUserEmails = await client.users.getEmails({}) || {};

              console.log('Github User and emails:',githubUser, githubUserEmails);
              // Create a token record
              console.log('Step 5: Create user record in database', body);
              var token = await Token.create({
                serviceName: 'githubUserOauth',
                tokenValue: githubOauthToken.access_token
                // tokenExpires: new Date(new Date().getTime()+1000*3600*24*10).getTime(),
              }).fetch();

              console.log('Created token for user:',token);

              var user = await User.findOne({
                githubLogin: githubUser.data && githubUser.data.login
              }).populate('githubOauthToken');

              var githubEmail = _.find(githubUserEmails.data, {primary: true});

              // If there is no user in the database associated
              // with this Github login, create one and associate
              // the oauth token with it.
              if (!user) {
                user = await User.create({
                  emailAddress: githubEmail.email || 'noemail@example.com',
                  githubLogin: githubUser.data && githubUser.data.login,
                  signupComplete: false,
                  githubUserData: githubUser.data,
                  githubOauthToken: token.id
                }).fetch();

                req.session.userId = user.id;
                req.session.save();

                console.log('Step 6: Redirecting new user to home page');
                return res.redirect('/');
              }

              // If the user does exist, just update their
              // token and github information then move on.
              else {

                // Destroy the old oauth token
                if (user.githubOauthToken && user.githubOauthToken.id) {
                  await Token.destroy({
                    id: user.githubOauthToken.id
                  });
                }

                user = await User.update({id: user.id}, {
                  emailAddress: githubEmail.email || 'noemail@example.com',
                  githubLogin: githubUser.data && githubUser.data.login,
                  signupComplete: false,
                  githubUserData: githubUser.data,
                  githubOauthToken: token.id
                }).fetch();

                user = user[0];

                req.session.userId = user.id;
                req.session.save();
                console.log('Step 6: Redirecting existing user to home page');
                return res.redirect('/');
              }

            });

          }
        }
      }
    }
  };
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
