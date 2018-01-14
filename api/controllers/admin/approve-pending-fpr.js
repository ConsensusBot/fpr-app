var _ = require('lodash');

module.exports = {


  friendlyName: 'Approve the listing of a pending FPR',


  description: 'Admin only',


  inputs: {
    formId: {
      type: 'number'
    }
  },

  exits: {

    success: {
      outputLabel: 'Success',
      outputExample: { }
    },

    badProposalId: {
      description: 'There exists no proposal with that id for the logged in user.'
    }

  },

  fn: async function (inputs, exits) {

    // Fetch the existing FundingProposal to make sure the id provided is
    // valid and that it it belongs to the logged in user.
    var formObject = await FundingProposal.findOne({id: inputs.formId});

    // If this fails, return an error alerting the user .
    if (!formObject) {
      console.log('Cannot find form with id', inputs.formId);
      throw ('badProposalId');
    }
    
    var updatedObject = {
      id: inputs.formId,
      status: 'listed',
      chatName: '#proj-'+_.camelCase(formObject.projectName.replace(/[^\d\w ]/ig,''))
    };

    // Grab the FPR with the highest fprId.  We will increment that number
    // by one and use it for this new FPR when we list it on Github.
    var mostRecentFPR = await FundingProposal.find({}).sort('fprId DESC').limit(1);
    mostRecentFPR = mostRecentFPR[0];

    if (mostRecentFPR && mostRecentFPR.fprId) {
      updatedObject.fprId = mostRecentFPR.fprId + 1;
    }
    else {
      updatedObject.fprId = 20;
    }

    // Update the Funding Proposal
    await FundingProposal.update({ id: formObject.id }, updatedObject );

    // Now Grab the users and populate their Github token
    var approvedUser = await User.findOne({
      id: formObject.user
    }).populate('githubOauthToken');

    // Pass the `FormProposal` object to the Github hook where
    // it will parse it and upload it to the official BCF Github repo
    // then submit a pull request on the user's behalf
    //
    var githubActionResults = await sails.hooks.github.submitUserFPR({ id: formObject.user }, { id: formObject.id }); 

    // Since the `update` method always returns an array,
    // return the only element in that array to our user.
    return exits.success(formObject[0]);

  }

};
