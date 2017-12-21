module.exports = {


  friendlyName: 'View system settings',


  description: '',


  inputs: {

    exchangeSlug: {
      dscription: 'The slug of the thing',
      type: 'string',
      example: 'blerg'
    },

  },


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/system-settings.ejs',
    },

    notFound: {
      description: 'There is nothing found with that slug.',
      responseType: 'notFound'
    },

  },


  fn: async function (inputs, exits) {

    return exits.success({
      pendingFprs: []
    });

  }


};
