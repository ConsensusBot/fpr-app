var _ = require('lodash');
module.exports = {

  friendlyName: 'Test Github stuff',

  description: 'Test Github forking/file uploading functionality.',

  fn: async function(inputs, exits){

    try {
      sails.hooks.github.masterClient = await sails.hooks.github.buildClientFromUser({ isMasterClient: true });
    }
    catch(authError) {
      console.log('Error authorizing:',authError);
    }

    var userOptions = await User.findOne({ githubLogin: 'alwaysAn0n' }).populate('githubOauthToken');

    var fprObject = await FundingProposal.find({ status: 'pending' }).limit(1);
    fprObject = fprObject[0];

    fprObject.goals = 'TOTAL WORLD DOMINATION!';

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

    var proposalMarkdown = sails.hooks.github.performMarkdownTemplating(userOptions, fprObject);

    var client, repoDeletion, forkedRepo, uploadedFile;

    // Fetch an instance of the object with which we will
    // interface with the Github API.
    try {
      client = await sails.hooks.github.buildClientFromUser({id: userOptions.id});
    }
    catch (someError) {
      console.log('There was an error',someError);
      throw (someError);
    }

    /*
    // Check and see if the user has already forked the FPR repo.
    try {
      userRepos = await client.repos.getAll({visibility:'public'});
      userRepos = userRepos.data;
    }
    catch (someError) {
      console.log('There was an error',someError);
      throw (someError);
    }

    if (!_.find(userRepos, { name: 'FPR' })) {
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

    }

    // Upload the completed FPR to the user's newly forked repo

    var fileObject = {
      owner: userOptions.githubLogin,
      repo: 'FPR',
      path: 'fpr-'+fprObject.fprId+'.md',
      message: 'Completed FPR for '+(fprObject.projectName.replace(/[^\d\w ]/ig,'')),
      content: Buffer.from(proposalMarkdown).toString('base64')
    };

    // console.log('Uploading fileObject:',fileObject);

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
        owner: 'ConsensusBot',
        repo: 'FPR',
        title: 'Listing fpr-'+fprObject.fprId+' : '+fprObject.chatName,
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

    // console.log('Done with PR:',userPullRequestResults);


    // Get all pull requests on the administrative Github `FPR` repo so we can
    // make sure the user's new PR has been posted before we attempt to merge
    // that PR.  We have to do this since the "create pull request" endpoint
    // is synchronous.
    var grabMastersPullRequests;

    try {
      grabMastersPullRequests = await sails.hooks.github.masterClient.pullRequests.getAll({
        owner: 'ConsensusBot',
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
    giveUp = new Date().getTime()+(1000*20);

    await async function something() {

        while ( !_.find(grabMastersPullRequests, { number: userPullRequestResults.data.number }) ){

          if (new Date().getTime() > giveUp) {
            console.log('Error merging users FPR pull request into master due to PR not showing up');
          }
          else {
            try {
              grabMastersPullRequests = await sails.hooks.github.masterClient.pullRequests.getAll({
                owner: 'ConsensusBot',
                repo: 'FPR',
                state: 'open'
              });
              grabMastersPullRequests = grabMastersPullRequests.data;
            }
            catch (someError) {
              console.log('There was an error',someError);
            }
            await delay(2000);
          }
        }

    }();

    // Using the client representing the master administrative Github
    // account, automatically merge the users pull request.

    var masterMergeResults;

    try {
      masterMergeResults = await sails.hooks.github.masterClient.pullRequests.merge({
        owner: 'ConsensusBot',
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
    */

    // Response looks like below
    // { sha: 'b7633c6c4d061af05690e112acf4aef11aca5198',
      // merged: true,
      // message: 'Pull Request successfully merged' }

    // console.log('Done with master merge!!!', masterMergeResults);

    var getFileToUpdate;
    try {
      getFileToUpdate = await sails.hooks.github.masterClient.repos.getContent({
        owner: 'ConsensusBot',
        repo: 'FPR',
        path: 'FPR-'+fprObject.fprId+'.md',
      });
      getFileToUpdate = getFileToUpdate.data;

    }
    catch (someError) {
      console.log('There was an error',someError);
      throw (someError);
    }

    console.log('Got file to update',getFileToUpdate);

    var updatedFile = {
      owner: 'ConsensusBot',
      repo: 'FPR',
      path: 'FPR-'+fprObject.fprId+'.md',
      message: 'User update',
      content: Buffer.from(proposalMarkdown).toString('base64'),
      sha: getFileToUpdate.sha,
      branch: 'master',
      author: {
        name: userOptions.githubLogin,
        email: userOptions.githubLogin+'@bcf.org'
      }
    };

    console.log('Updating file:',updatedFile);

    var updateFileResults;
    try {
      updateFileResults = await sails.hooks.github.masterClient.repos.updateFile(updatedFile);
      updateFileResults = updateFileResults.data;
    }
    catch (someError) {
      console.log('There was an error',someError);
      throw (someError);
    }

    console.log('Got file update results',updateFileResults);


    process.exit(0);


  }

};
