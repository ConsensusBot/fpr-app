/**
 * FundingProposalController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  friendlyName: 'Submission from the form page to the FundingProposal endpoint',

  inputs: {
    formId: {
      type: 'number'
    }
  },

  exits: {

    badId: {
      description: 'We cannot find that project.'
    }

  },

  fn: async function (inputs, exits)  {

    console.log('Reviewing form',inputs.formId);

    // If a form `id` wasn't included as a route param, redirect 
    // the admin to the pending FPR list.
    if (!inputs.formId) {
      this.res.redirect('/system/pending');
    };

    var formToReturn = await FundingProposal.findOne({
      id: inputs.formId
    });

    // If that form can't be found, return a badId error
    if (!formToReturn) {
      throw('badId');
    }

    this.res.view('pages/admin/form-review', {
      formObject: formToReturn
    });

  }

};
