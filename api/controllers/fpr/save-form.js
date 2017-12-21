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
    readyForSubmission: {
      type: 'boolean'
    },
    listedOnGithub: {
      type: 'boolean'
    },
    id: {
      type: 'number'
    }
  },

  exits: {

    success: {
      outputLabel: 'The new trade window',
      outputExample: {
        name: '30 seconds',
        duration: 30
      }
    },

    badProposalId: {
      description: 'There exists no proposal with that id for the logged in user.'
    }

  },

  fn: async function (inputs, exits)  {

    console.log('saving form:', inputs);

    // Fetch the existing FundingProposal to make sure the id provided is
    // valid and that it it belongs to the logged in user.
    var formObject = await FundingProposal.findOne({
      user: this.req.me.id,
      id: inputs.id
    });

    // If this fails, return an error alerting the user .
    if (!formObject) {
      console.log('Cannot find form for user', this.req.me.id, 'with id', inputs.id);
      throw ('badProposalId');
    }

    var updatedObject = _.pick(inputs, _.without(_.keys(inputs), 'id') );

    // If the user is toggling the submit button, set the FormProposal's 
    // status field to "pending" (for submit) or "draft" (for unsubmit)
    if (inputs.readyForSubmission === true) {
      updatedObject.status = 'pending';
    }
    
    if (inputs.readyForSubmission === false) {
      updatedObject.status = 'draft';
    }

    // Otherwise, update the FundingProposal then return
    // a fresh copy to the client.  Don't update the `id`
    // attribute.
    formObject = await FundingProposal.update({ id: formObject.id }, updatedObject ).fetch();

    // Since the `update` method always returns an array,
    // return the only element in that array to our user.
    return exits.success(formObject[0]);

  }

};
