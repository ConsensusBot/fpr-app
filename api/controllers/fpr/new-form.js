/**
 * FundingProposalController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  friendlyName: 'Creates a new form page to the FundingProposal endpoint',

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
    },
    status: {
      type: 'string'
    },
    formId: {
      type: 'number'
    }
  },

  exits: {

  },

  fn: async function (inputs, exits)  {

      formToReturn = await FundingProposal.create({
        projectName: '',
        startDate: '',
        hashtag: '',
        chatName: '',
        stakeholders: '',
        projectSummary: '',
        resources: '',
        budget: '',
        timeline: '',
        goals: '',
        other: '',
        status: 'draft',
        user: this.req.session.userId
      }).fetch();

  this.res.redirect('/form');

  }

};
