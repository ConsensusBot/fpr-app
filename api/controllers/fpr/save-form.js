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
    id: {
      type: 'number'
    }
  },

  exits: {

    badProposalId: {
      description: 'There exists no proposal with that id for the logged in user.'
    }

  },

  fn: async function (inputs, exits)  {

    // Grab the user so we can check if they are an admin
    var user = await User.findOne(this.req.session.userId);

    var findProposalQuery = {
      id: inputs.id
    };

    // If the user isn't an admin, add their user id
    // to the search query.  This will keep people from
    // modifying proposals that don't belong to them.
    if (!this.req.me.isSuperAdmin) {
      findProposalQuery.user = this.req.me.id
    }

    // Fetch the existing FundingProposal to make sure the id provided is
    // valid and that it it belongs to the logged in user.
    var formObject = await FundingProposal.findOne(findProposalQuery);

    // If this fails, return an error alerting the user .
    if (!formObject) {
      console.log('Cannot find form for user', this.req.me.id, 'with id', inputs.id);
      throw ('badProposalId');
    }

    var updatedObject = _.pick(inputs, _.without(_.keys(inputs), 'id') );

    // Update the FundingProposal then return
    // a fresh copy to the client.  Don't update the `id`
    // attribute.
    formObject = await FundingProposal.update({ id: formObject.id }, updatedObject ).fetch();

    // Since the `update` method always returns an array,
    // return the only element in that array to our user.
    return exits.success(formObject[0]);

  }

};
