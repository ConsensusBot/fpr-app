module.exports = {


  friendlyName: 'Approve the listing of a pending FPR',


  description: 'Admin only',


  inputs: {
    goals: {
      type: 'string'
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

    console.log('Approving FPR!',inputs);

    // 1. Update the FundingProposal with the `approved` status and a unique sequential 3 digit `fprId` starting with 100
    // 2. Call the function in the github hook that forks the docs repo and uploads a filled out FPR template then submits a PR (not ready yet)
    // 3. Profit!

    return exits.success();

  }

};
