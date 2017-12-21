module.exports = {


  friendlyName: 'View homepage or redirect',


  description: 'Display the home page if not logged in (FUTURE), or redirect to the appropriate place if logged in.',


  inputs: {

  },


  exits: {

    success: {
      viewTemplatePath: 'pages/entrance/login'//<< FUTURE: use template for homepage when there is one
    },

    redirect: {
      responseType: 'redirect'
    }

  },


  fn: async function (inputs, exits) {

    // If this request originated from an admin user, show the global system settings page.
    if (this.req.me && this.req.me.isSuperAdmin) {
      return exits.redirect('/system');
    }
    // Otherwise, if this request originated form any other kind of user, show the summary page.
    if (this.req.me) {
      return exits.redirect('/forms');
    }

    // Otherwise, this request did not come from a logged-in user.
    return exits.success();

  }


};
