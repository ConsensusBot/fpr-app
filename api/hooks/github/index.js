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
    // Synchronous function for creating the FPR template markdown files
    // from the user's information and their web form submission.
    templateProposalMarkdown: function(userOptions, fprObject) {

      var proposalMarkdown = `
        # ![BCF Logo Round Tiny](https://raw.githubusercontent.com/The-Bitcoin-Cash-Fund/Branding/master/BCF%20Symbol%20Round%20Tiny.png)
        BCF Funding Proposal Request Template

        **Project Name:**
        <%= projectName %>

        **FPR Id:**
        <%= fprId %>

        **Start Date:**
        <%= startDate %>

        **Hashtag:**
        <%= hashtag %>

        **Name of BCF Gitter community room:**
        <%= chatName %>

        **Stakeholders:**
        <%= stakeholders %>

        **Project Summary:**
        <%= projectSummary %>

        **Resources:**
        <%= resources %>

        **Budget:**
        <%= budget %>

        **Timeline:** 
        <%= timeline %>

        **Goals:**
        <%= goals %>

        **Other:**
        <%= other %>
      `;

      // Remove leading whitespace at the beginning of each line,
      // escape characters that might break during templating, 
      // then inject the formObject variables into the template.
      proposalMarkdown = _.map(proposalMarkdown.split('\n'), _.trim).join('\n');
      proposalMarkdown = _.escape(_.template(proposalMarkdown)(fprObject));

      return proposalMarkdown;

    },
    templateEvaluationMarkdown: function(userOptions, evalOptions) {

      var evaluationMarkdown = `
        # FPR Evaluation of FPR-<%= fprId %>

              Status - Partially Accepted - Changes required

        - [ ] **1. Has the FPR been submitted correctly?**  
        ⋅⋅⋅- [ ] A. Correctly titled?
        ⋅⋅⋅- [ ] B. Used the full FPR template?
        ⋅⋅⋅- [ ] C. Pull request correctly made to the BCF FPR repo?
          
        - [ ] **2. Have all sections of the template been completed?**  
        ⋅⋅⋅- [ ] A. Project Name
        ⋅⋅⋅- [ ] B. Start Date
        ⋅⋅⋅- [ ] C. Hashtag
        ⋅⋅⋅- [ ] D. Name of BCF Chat room
        ⋅⋅⋅- [ ] E. Stakeholders
        ⋅⋅⋅- [ ] F. Project Summary
        ⋅⋅⋅- [ ] G. Resources
        ⋅⋅⋅- [ ] H. Budget
        ⋅⋅⋅- [ ] I. Timeline
        ⋅⋅⋅- [ ] J. Goals
        ⋅⋅⋅- [ ] K. Other
          
        - [ ] **3. Is it well formatted for legibility?**

        - [ ] **4. Does the project have a non-profit purpose?**
          
        - [ ] **5. Has it been completed with enough detail for the scale of the project?**

        - [ ] **6. Is the team trustworthy enough for the funding requirement?**

        - [ ] **7. Are the objectives S.M.A.R.T?**  
        ⋅⋅⋅- [ ] A. Specific
        ⋅⋅⋅- [ ] B. Measurable
        ⋅⋅⋅- [ ] C. Agreed Upon
        ⋅⋅⋅- [ ] D. Realistic
        ⋅⋅⋅- [ ] E. Time-bound 

        - [ ] **8. Are the stakeholders realistically providing volunteered time?**
          
        - [ ] **9. Is the cost vs impact satisfactory?**
          
        Cost = TODO

        Impact

        - TODO
          
        - [ ] **10. Has the FPR been accepted or denied?**  
        ⋅⋅⋅- [ ] Accepted.
        ⋅⋅⋅- [ ] Accepted with Comments.
        ⋅⋅⋅- [ ] Partially Accepted - See Comments. 
        ⋅⋅⋅- [ ] Denied - See Comments.  
        ⋅⋅⋅- [ ] Denied.
          
        **11. Comments and, if denied, reasons for denial.**  
        ⋅⋅⋅- TODO
      `;

      // Remove leading whitespace at the beginning of each line,
      // escape characters that might break during templating, 
      // then inject the formObject variables into the template.
      evaluationMarkdown = _.map(evaluationMarkdown.split('\n'), _.trim).join('\n').replace(/⋅⋅⋅/ig,'   ');
      evaluationMarkdown = _.escape(_.template(evaluationMarkdown)(evalOptions));

      return evaluationMarkdown;

    },
    updateListedFPR: async function(ownerQuery, fprQuery, userChangedByQuery) {
      // Grab the FPR being changed, the user making the change, and the user
      // who originally submitted the FPR.  If that user isn't also the one
      // making the change then an admin must be doing it and we'll cite them.
      var ownerOptions = await User.findOne({ id: ownerQuery.id }).populate('githubOauthToken');
      var fprObject = await FundingProposal.findOne({ id: fprQuery.id });

      var userChangedByOptions;
      if (userChangedByQuery && userChangedByQuery.id) {
        userChangedByOptions = await User.findOne({ id: userChangedByQuery.id });
      }

      // If `userChangedByQuery` wasn't included, we'll assume the user making
      // the change is the one who originally submitted the PR.
      else {
        userChangedByOptions = ownerOptions;
      }

      // Compile the markdown.  Here we assume the changes have already
      // been written to our database but haven't yet hit Github.
      var proposalMarkdown = sails.hooks.github.templateProposalMarkdown(ownerOptions, fprObject);

      // Get the contents of the FPR we are updating.  We need the file's
      // "sha" otherwise the API won't let us update it.
      var getFileToUpdate;
      try {

        getFileToUpdate = await sails.hooks.github.masterClient.repos.getContent({
          owner: sails.config.github.githubAdminAccount,
          repo: 'FPR',
          path: 'FPR-'+fprObject.fprId+'.md',
        });
        getFileToUpdate = getFileToUpdate.data;

      }
      catch (someError) {
        console.log('There was an error', someError);
        throw (someError);
      }

      var updatedFile = {
        owner: sails.config.github.githubAdminAccount,
        repo: 'FPR',
        path: 'FPR-'+fprObject.fprId+'.md',
        content: Buffer.from(proposalMarkdown).toString('base64'),
        sha: getFileToUpdate.sha,
        branch: 'master'
      };

      // If the owner of the FPR is making the change, use
      // their information.  Otherwise, cite the admin who
      // is updating the FPR on behalf of the user.
      if (userChangedByOptions.id === ownerOptions.id) {
        updatedFile.message = 'User update';
        updatedFile.author = {
          name: ownerOptions.githubLogin,
          email: ownerOptions.emailAddress || ownerOptions.githubLogin+'@bcf.org'
        };
      }
      else {
        updatedFile.message = 'Admin update';
        updatedFile.author = {
          name: userChangedByOptions.githubLogin,
          email: userChangedByOptions.emailAddress || userChangedByOptions.githubLogin+'@bcf.org'
        };
      }

      var updateFileResults;
      try {
        updateFileResults = await sails.hooks.github.masterClient.repos.updateFile(updatedFile);
        updateFileResults = updateFileResults.data;
      }
      catch (someError) {
        console.log('There was an error',someError);
        throw (someError);
      }

      return {
        results: updateFileResults
      };

    },
    submitUserFPR: async function(userQuery, fprQuery) {

      var userOptions = await User.findOne({ id: userQuery.id }).populate('githubOauthToken');
      var fprObject = await FundingProposal.findOne({ id: fprQuery.id });

      // Turn the fprId into a 4 digit string representing a number
      fprObject.fprId = ''+fprObject.fprId;
      while (fprObject.fprId.length < 4) {
        fprObject.fprId = '0'+fprObject.fprId;
      }

      var evaluationMarkdown = sails.hooks.github.templateEvaluationMarkdown({}, fprObject);
      var proposalMarkdown = sails.hooks.github.templateProposalMarkdown(userOptions, fprObject);

      var client, repoDeletion, forkedRepo, uploadedEval, uploadedFile;

      // Fetch an instance of the object with which we will
      // interface with the Github API.
      try {
        client = await sails.hooks.github.buildClientFromUser({id: userOptions.id});
      }
      catch (someError) {
        console.log('There was an error',someError);
        throw (someError);
      }

      // Check and see if the user has already forked the FPR repo.
      try {
        userRepos = await client.repos.getAll({visibility:'public'});
        userRepos = userRepos.data;
      }
      catch (someError) {
        console.log('There was an error',someError);
        throw (someError);
      }


      // If the user already has the FPR repo forked, delete it
      if (_.find(userRepos, { name: 'FPR' })) {
        var repoDeletionResults;
        try {
          repoDeletionResults = await client.repos.delete({owner:userOptions.githubLogin, repo:'FPR'});
        }
        catch (someError) {
          console.log('There was an error',someError);
          throw (someError);
        }

        return {
          status: 'done'
        };
      }


      // Now fork a fresh copy!
      try {
        forkedRepo = await client.repos.fork({ owner:'The-Bitcoin-Cash-Fund', repo:'FPR' });
      }
      catch (someError) {
        console.log('There was an error',someError);
        throw (someError);
      }
      
      // Since the repo form is asyncronous, enter a loop
      // that keeps us from proceeding until the repo 
      // shows up on the user's account.
      var delay = ms => new Promise(resolve => setTimeout(resolve, ms));

      // If the repo doesn't show up after 20 seconds,
      // we will give up and throw an error.
      var giveUp = new Date().getTime()+(1000*30);

      await async function something() {

          while ( !_.find(userRepos,{ name: 'FPR' }) ){

            try {
              userRepos = await client.repos.getAll({visibility:'public'});
              userRepos = userRepos.data;
            }
            catch (someError) {
              console.log('There was an error',someError);
            }
            await delay(2000);
          }

      }();


      // Upload the evaluation template and create a new project folder

      var fileObject = {
        owner: userOptions.githubLogin,
        repo: 'FPR',
        path: 'FPR-'+fprObject.fprId+'/EVAL-'+fprObject.fprId+'.md',
        message: 'Evaluation form for '+(fprObject.projectName.replace(/[^\d\w ]/ig,'')),
        content: Buffer.from(evaluationMarkdown).toString('base64')
      };

      try {
        uploadedEval = await client.repos.createFile(fileObject);
      }
      catch (someError) {
        console.log('There was an error',someError);
        throw (someError);
      }

      // Upload the completed FPR to the user's newly forked repo

      var fileObject = {
        owner: userOptions.githubLogin,
        repo: 'FPR',
        path: 'FPR-'+fprObject.fprId+'.md',
        message: 'Completed FPR for '+(fprObject.projectName.replace(/[^\d\w ]/ig,'')),
        content: Buffer.from(proposalMarkdown).toString('base64')
      };

      try {
        uploadedFile = await client.repos.createFile(fileObject);
      }
      catch (someError) {
        console.log('There was an error',someError);
        throw (someError);
      }

      // Submit a pull request to the master repo on behalf of the user.
      var userPullRequestResults;

      try {
        userPullRequestResults = await client.pullRequests.create({
          owner: sails.config.github.githubAdminAccount,
          repo: 'FPR',
          title: 'Listing FPR-'+fprObject.fprId+': '+fprObject.chatName,
          head: userOptions.githubLogin+':master',
          base: 'master',
          // body: '',
          maintainer_can_modify: true
        });
      }
      catch (someError) {
        console.log('There was an error',someError);
        throw (someError);
      }

      // Get all pull requests on the administrative Github `FPR` repo so we can
      // make sure the user's new PR has been posted before we attempt to merge
      // that PR.  We have to do this since the "create pull request" endpoint
      // is synchronous.
      var grabMastersPullRequests;

      try {
        grabMastersPullRequests = await sails.hooks.github.masterClient.pullRequests.getAll({
          owner: sails.config.github.githubAdminAccount,
          repo: 'FPR',
          state: 'open'
        });
        grabMastersPullRequests = grabMastersPullRequests.data;
      }
      catch (someError) {
        console.log('There was an error',someError);
        throw (someError);
      }

      // If the repo doesn't show up after 20 seconds,
      // we will give up and throw an error.
      giveUp = new Date().getTime()+(1000*30);

      await async function something() {

          while ( !_.find(grabMastersPullRequests, { number: userPullRequestResults.data.number }) ){

            if (new Date().getTime() > giveUp) {
              console.log('Error merging users FPR pull request into master due to PR not showing up');
            }
            else {
              try {
                grabMastersPullRequests = await sails.hooks.github.masterClient.pullRequests.getAll({
                  owner: sails.config.github.githubAdminAccount,
                  repo: 'FPR',
                  state: 'open'
                });
                grabMastersPullRequests = grabMastersPullRequests.data;
              }
              catch (someError) {
                console.log('There was an error',someError);
              }
              await delay(3000);
            }
          }

      }();

      // Using the client representing the master administrative Github
      // account, automatically merge the users pull request.

      var masterMergeResults;

      try {
        masterMergeResults = await sails.hooks.github.masterClient.pullRequests.merge({
          owner: sails.config.github.githubAdminAccount,
          repo: 'FPR',
          number: userPullRequestResults.data.number,
          commit_title: userPullRequestResults.data.title,
          merge_method: 'merge'
        });
        masterMergeResults = masterMergeResults.data;
      }
      catch (someError) {
        console.log('There was an error',someError);
        throw (someError);
      }

      // Finally, delete the user's fork of the FPR repo since they
      // won't be needing it anymore.  Future updates will only happen
      // through the web app and they will be done for the user by the 
      // FSR repo's administrative client.
      var repoDeletionResults;
      try {
        repoDeletionResults = await client.repos.delete({owner:userOptions.githubLogin, repo:'FPR'});
      }
      catch (someError) {
        console.log('There was an error',someError);
        throw (someError);
      }

      return {
        status: 'done'
      };

    },
    buildClientFromUser: async function(options) {

      var user;
      if (options.isMasterClient) {

        user = {
          githubOauthToken: {
            tokenValue: sails.config.github.personalAccessToken
          }
        };

      }
      else {
        user = await User.findOne(options).populate('githubOauthToken');
      }

      if (!user.githubOauthToken) {
        console.log('No token associated with user!',options,user);
        return;
      }

      var client = new GitHubApi({
        headers: {
          'Authorization': 'Bearer '+user.githubOauthToken.tokenValue,
          'Accept': 'application/vnd.github.machine-man-preview+json',
          'User-Agent': sails.config.github.oauth.userAgent
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
      sails.after(['lifted'], async ()=>{

        // Get a node-github client instance for the master administrative
        // account so we can interact with the Github API on it's behalf.
        try {
          sails.hooks.github.masterClient = await sails.hooks.github.buildClientFromUser({ isMasterClient: true });
        }
        catch(authError) {
          console.log('Error authorizing:',authError);
        }
        // process.exit(0);
      });

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

    // This is where the node-github instance representing the client
    // for the administrative Github account lives.  This account houses
    // the master repo containing all the FPRs approved for listing.
    // 
    // It is populated using the `initialize` function that runs after 
    // the app has successfully lifted.
    masterClient: undefined,

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
            // console.log('Got a webhook!');

            // console.log('req.allParams()',req.body);
            return res.sendStatus(200);
          }
        },
        '/git/login': {
          skipAssets: true,
          fn: async function(req, res, next){
            console.log('Step 1: User initiates app authorization!');

            return res.view('pages/github/login', {
              beginInstallLink: 'http://github.com/login/oauth/authorize?scope=user,repo,delete_repo&client_id='+sails.config.github.oauth.clientId+'&redirect_uri='+sails.config.github.oauth.redirectUrl
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

                await Token.update(token.id, { user: user.id});

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
