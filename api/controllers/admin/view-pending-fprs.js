module.exports = {


  friendlyName: 'View Pending FPR forms',


  description: '',


  inputs: {

  },

  exits: {

    success: {
      viewTemplatePath: 'pages/admin/pending-fpr-forms.ejs',
    }

  },

  fn: async function (inputs, exits) {

    return exits.success({
      forms: await FundingProposal.find({ status: 'pending' }).populate('user')
    });

  }

};
