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
console.log('Ready to fork');
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
console.log('Forked! Ready to upload Eval');


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

console.log('Eval uploaded! Ready to upload FPR');


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
console.log('FPR uploaded! Ready to get PRs');

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
console.log('PRs fetched.  Ready to submit PR');

    // Using the client representing the master administrative Github
    // account, automatically merge the users pull request.

    var masterMergeResults;

    var mergeObject = {
      owner: sails.config.github.githubAdminAccount,
      repo: 'FPR',
      number: userPullRequestResults.data.number,
      commit_title: userPullRequestResults.data.title,
      merge_method: 'merge'
    };

    console.log('MergeObject:',mergeObject);

    try {
      masterMergeResults = await sails.hooks.github.masterClient.pullRequests.merge(mergeObject);
      masterMergeResults = masterMergeResults.data;
    }
    catch (someError) {
      console.log('There was an error',someError);
      throw (someError);
    }
console.log('Done submitting PR.  Ready to delete!');
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
console.log('Done deleting!');
    // return {
    //   status: 'done'
    // };

    process.exit(0);

  }

};
