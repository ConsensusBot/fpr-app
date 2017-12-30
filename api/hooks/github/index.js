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
    testTing: async function(userOptions, fprObject) {

      userOptions = await User.findOne(userOptions.id);

      var proposalMarkdown = `
        # ![BCF Logo Round Tiny](https://raw.githubusercontent.com/The-Bitcoin-Cash-Fund/Branding/master/BCF%20Symbol%20Round%20Tiny.png) BCF Funding Proposal Request Template

        **Project Name:**
        ${fprObject.projectName}

        **FPR Id:**
        ${fprObject.fprId}

        **Start Date:**
        ${fprObject.startDate}

        **Hashtag:**
        ${fprObject.hashtag}

        **Name of BCF Gitter community room:**
        ${fprObject.chatName}

        **Stakeholders:**
        ${fprObject.stakeholders}

        **Project Summary:**
        ${fprObject.projectSummary}

        **Resources:**
        ${fprObject.resources}

        **Budget:**
        ${fprObject.budget}

        **Timeline:** 
        ${fprObject.timeline}

        **Goals:**
        ${fprObject.goals}

        **Other:**
        ${fprObject.other}
      `;

      var client = await sails.hooks.github.buildClientFromUser({id: userOptions&&userOptions.id});

      // Fork The-Bitcoin-Cash-Fund/FPR

      var forkedRepo;
      try {
        forkedRepo = await client.repos.fork({ owner:'The-Bitcoin-Cash-Fund', repo:'FPR' });
      }
      catch (forkError) {
        console.log('Error forking repo:',forkError);
        throw('Fork error');
      }

      console.log('Forking results:',forkedRepo);

      proposalMarkdown = JSON.stringify(_.escape(proposalMarkdown));

      console.log('Markdown:',proposalMarkdown);
      // process.exit();

      // Now upload the template file to our new forked repo
      var uploadedFile;

      var fileToCreate = {
        owner: userOptions.githubLogin,
        repo: 'FPR',
        path: 'fpr-'+fprObject.fprId+'.md',
        message: 'Completed FPR for '+(fprObject.projectName.replace(/[^\d\w ]/ig,'')),
        // content: Buffer.from(proposalMarkdown).toString('base64')
        content: Buffer.from('cats!').toString('base64')
      };

      console.log('Creating file:',fileToCreate);

      try {
        uploadedFile = await client.repos.createFile(fileToCreate);
      }
      catch (uploadError) {
        console.log('Error uploading file:',uploadError);
        console.log('uploaded file:',)
        throw('Upload error');
      }

      console.log('Upload Results:',uploadedFile);

      // var userInfo = await client.users.get({});
      // var userEmails = await client.users.getEmails({});
      // console.log('User Info',userInfo);
      // console.log('User Emails:',userEmails);

      return {
        status: 'done'
      };

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

              // Step 3: We exchanged the code for a token
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

              // Step 4: Using access token to get Github User info!
              // 
              // Get the user's Github information so we can 
              // bootstrap their profile with it
              var githubUser = await client.users.get({}) || {};
              var githubUserEmails = await client.users.getEmails({}) || {};
              var primaryGithubEmail = _.find(githubUserEmails.data, {primary: true});

              // console.log('Github User and emails:',githubUser, githubUserEmails, primaryGithubEmail);

              // Step 5: Create user record in database

              var token;

              // Do we already have a user?
              var user = await User.findOne({
                githubLogin: githubUser.data && githubUser.data.login
              }).populate('githubOauthToken');

              // If there is no user in the database associated
              // with this Github login, create one along with a new
              // oauth token then associate them both ways.
              if (!user) {

                token = await Token.create({
                  serviceName: 'githubUserOauth',
                  tokenValue: githubOauthToken.access_token
                }).fetch();

                user = await User.create({
                  emailAddress: primaryGithubEmail.email || 'noemail@example.com',
                  githubLogin: githubUser.data && githubUser.data.login,
                  signupComplete: false,
                  githubUserData: githubUser.data,
                  githubOauthToken: token.id
                }).fetch();

                await token.update(user.id, { user: user.id});

                req.session.userId = user.id;
                req.session.save();

                // Step 6: Redirecting new user to home page
                return res.redirect('/');
              }

              // If the user DOES exist, update their old
              // token and their user profile.
              else {

                if (user.githubOauthToken) {

                  try {
                    token = await Token.update(user.githubOauthToken.id, {
                      tokenValue: githubOauthToken.access_token
                    }).fetch();
                  }
                  catch (error) {
                    console.log('There be a bloody error mate:',error,user);
                  }

                  token = token[0];

                }
                else {

                  token = await Token.create({
                    serviceName: 'githubUserOauth',
                    tokenValue: githubOauthToken.access_token,
                    user: user.id
                  }).fetch();

                }
                try {
                  user = await User.update({id: user.id}, {
                    emailAddress: primaryGithubEmail.email || 'noemail@example.com',
                    githubLogin: githubUser.data && githubUser.data.login,
                    signupComplete: false,
                    githubUserData: githubUser.data,
                    githubOauthToken: token.id
                  }).fetch();
                }
                catch (error) {
                  console.log('There be a bloody error mate:',error,user);
                }

                user = user[0];
                req.session.userId = user.id;
                req.session.save();

                // Step 6: Redirecting existing user to home page
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
