/**
 * FundingProposalController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  friendlyName: 'Submission from the form page to the FundingProposal endpoint',

  inputs: {

    projectName: {
      type: 'string'
    },
    startDate: {
      type: 'string'
    },
    hashtag: {
      type: 'string'
    },
    bcfName: {
      type: 'string'
    },
    stakeholders: {
      type: 'string'
    },
    projectSummary: {
      type: 'string'
    },
    resources: {
      type: 'string'
    },
    budget: {
      type: 'string'
    },
    timeline: {
      type: 'string'
    },
    goals: {
      type: 'string'
    },
    other: {
      type: 'string'
    }

  },

  exits: {

    success: {

      viewTemplatePath: '/account/all-fpr-forms'

    }

  },

  fn: async function (inputs, exits)  {
    console.log('Returning forms for user:',this.req.me.id);

    var userForms = ( await FundingProposal.find({ user: this.req.me.id }) || [] );

    // Check if the owner has an existing fork of the `FPR` repo
    // so we can warn them that it will be deleted
    var githubAccountIsDirty = await sails.hooks.github.checkForExistingRepoFork({ id: this.req.session.userId });

    return this.res.view('pages/account/all-fpr-forms', {
      submissionWarning: githubAccountIsDirty ? 'Your Github account already has a fork of the `The-Bitcoin-Cash-Fund/FPR` repo.  Please backup that work immediately.  When your new project is listed by the admins, YOUR WORK IN THAT REPO WILL BE DELETED ON GITHUB!!' : undefined,
      forms: _.groupBy(userForms, 'status')
    });
  }

};
