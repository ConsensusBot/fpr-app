/**
 * FundingProposalController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  friendlyName: 'Submission from the form page to the FundingProposal endpoint',

  inputs: {



  },

  exits: {

    success: {

      viewTemplatePath: '/form'

    }

  },

  fn: async function (inputs, exits)  {

    console.log('Working!');

  }

};
