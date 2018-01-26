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
    },
    status: {
      type: 'string'
    },
    formId: {
      type: 'number'
    }
  },

  exits: {

    success: {
      viewTemplatePath: '/account/fpr-success'
    },
    badId: {
      description: 'We cannot find that project.'
    }

  },

  fn: async function (inputs, exits)  {

    console.log('URL:',this.req.originalUrl);

    var formToReturn;

    // If a form `id` was included as a route param, fetch that form and return it.
    if (inputs.formId) {
      console.log('loading form:',inputs.formId);

      // Grab the user so we can check if they are an admin
      var user = await User.findOne(this.req.session.userId);

      var findProposalQuery = {
        id: inputs.formId
      };

      // If the user isnt an admin, add their user id
      // to the search query.  This will keep people from
      // seeing unfinished proposals that don't belong to them.
      if (!user.isSuperAdmin) {
        findProposalQuery.user = this.req.session.userId
      }

      formToReturn = await FundingProposal.findOne(findProposalQuery);

      // If that form can't be found, return a badId error
      if (!formToReturn) {
        throw('badId');
      }
    }
    if (!formToReturn) {
      formToReturn = await FundingProposal.find().sort('createdAt DESC').limit(1);

    }

    this.res.view('pages/account/fpr-form', {
      formObject: formToReturn.length ? formToReturn[0] : formToReturn
    });

  }

};
