var _ = require('lodash');
module.exports = {

  friendlyName: 'Test Github stuff',

  description: 'Test Github forking/file uploading functionality.',

  fn: async function(inputs, exits){

    var userOptions = await User.findOne({ githubLogin: 'alwaysAn0n' }).populate('githubOauthToken');

    var fprObject = await FundingProposal.findOne({ id: 45 });

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
      console.log('Looks like the FPR repo hasnt been forked yet so we need to do that!');
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

          console.log('Found the FPR Repo!');
      }();

    }

    else {
      console.log('User already forked FPR repo.  Uploading file now.');
    }
    
    // try {
    //   repoDeletion = await client.repos.delete({owner:'alwaysAn0n', repo:'FPR'});
    // }
    // catch (someError) {
    //   console.log('There was an error',someError);
    //   throw (someError);
    // }

    // Upload the completed FPR to the user's newly forked repo
    try {
      uploadedFile = await client.repos.createFile({
        owner: userOptions.githubLogin,
        repo: 'FPR',
        path: 'fpr-'+fprObject.fprId+Math.floor(Math.random()*1000+1)+'.md',
        message: 'Completed FPR for '+(fprObject.projectName.replace(/[^\d\w ]/ig,'')),
        content: Buffer.from(proposalMarkdown).toString('base64')
      });
    }
    catch (someError) {
      console.log('There was an error',someError);
      throw (someError);
    }

  }

};
