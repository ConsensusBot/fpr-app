/**
 * FundingProposal.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    projectName: {
      type: 'string',
      required: true,
      description: 'Name of the applicants proposed project'
    },

    startDate:  {
      type: 'string',
      required: true,
      description: 'Date that the github repo was created'
    },

    hashtag: {
      type: 'string',
      description: 'A hashtag for the project'
    },

    bcfName: {
      type: 'string',
      description: 'Name of the BCF Gitter community room'
    },

    stakeholders: {
      type: 'string',
      required: true
    },

    projectSummary: {
      type: 'string',
      required: true
    },

    resources: {
      type: 'string',
      required: true,
      description: 'List of required resources for the project'
    },

    budget: {
      type: 'string',
      required: true
    },

    timeline: {
      type: 'string',
      required: true,
      description: 'What will be happening and when'
    },

    goals: {
      type: 'string',
      required: true
    },

    other: {
      type: 'string'
    }

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  },

};

