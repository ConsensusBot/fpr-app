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

    return this.res.view('pages/account/all-fpr-forms', {
      forms: _.groupBy(userForms, 'status')
    });
  }

};
