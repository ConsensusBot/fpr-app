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

    // Don't allow the user to change the 'status' to "listed". 
    // Also don't let them change the 'id'. If the document has
    // already been listed on Github, call the Github Hook to 
    // submit a PR for the change.
    if (inputs.status && inputs.status === 'listed' && formObject.status !== 'listed') {
      delete inputs.status;
    }

    var allowedParams = ['projectName','startDate','hashtag','stakeholders','projectSummary','resources','budget','timeline','goals','other','status'];
    var updatedObject = _.extend(_.pick(inputs, allowedParams), {});

    // Update the FundingProposal then return
    // a fresh copy to the client.
    formObject = await FundingProposal.update({ id: formObject.id }, updatedObject ).fetch();
    formObject = formObject[0];

    // If the user is editing an FPR that has already been listed
    // on Github, have the Github hook submit a PR for the change
    // then automatically merge it.
    var githubUpdateResults;
    if (formObject.status === 'listed') {
      try {
        pullRequestResults = await sails.hooks.github.updateListedFPR(
          // Waterline Query to fetch the FPR's owner
          { id: formObject.user },
          // Waterline Query to fetch the updated form object
          { id: formObject.id },
          // Waterline query to fetch the admin that's making the change
          (this.req.me.isSuperAdmin ? { id: this.req.me.id } : undefined)
        );
      }
      catch (someError) {
        console.log('There was an error', someError);
        throw (someError);
      }
    }

    // Since the `update` method always returns an array,
    // return the only element in that array to our user.
    return exits.success(formObject);

  }

};
