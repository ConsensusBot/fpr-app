/**
 * FundingProposal.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  // migrate:'alter',
  attributes: {

    projectName: {
      type: 'string',
      //required: true,
      description: 'Name of the applicants proposed project'
    },

    startDate:  {
      type: 'string',
      //required: true,
      description: 'Date that the github repo was created'
    },

    hashtag: {
      type: 'string',
      description: 'A hashtag for the project'
    },

    chatName: {
      type: 'string',
      description: 'Name of the BCF Rocketchat community room'
    },

    stakeholders: {
      type: 'string',
      //required: true
    },

    projectSummary: {
      type: 'string',
      //required: true
    },

    resources: {
      type: 'string',
      //required: true,
      description: 'List of required resources for the project'
    },

    budget: {
      type: 'string',
      //required: true
    },

    timeline: {
      type: 'string',
      //required: true,
      description: 'What will be happening and when'
    },

    goals: {
      type: 'string',
      //required: true
    },

    other: {
      type: 'string'
    },

    // How far along is this FPR through the process of getting
    // administrator approval to be officially considered and
    // listed on the Github repo?
    // ENUM: 'draft', 'pending', 'listed'
    status: {
      type: 'string'
    },

    fprId: {
      type: 'number'
    },

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    user: {
      model: 'User'
    }


  },

};

