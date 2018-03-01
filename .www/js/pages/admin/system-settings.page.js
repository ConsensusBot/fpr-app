'use strict';

parasails.registerPage('system-settings', {

  //  ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {

    // Raw locals from server:
    // ================================================
    // windows: undefined,

    // Everything else:
    // ================================================

    // Whether the add form is visible.
    addFormVisible: false,

    // Main syncing/loading state for this page.
    syncing: false,

    // Form data
    formData: {/* … */},

    // For tracking client-side validation errors in our form.
    // > Has property set to `true` for each invalid property in `formData`.
    formErrors: {/* … */},

    // Server error state for the form
    cloudError: ''
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function beforeMount() {
    _.extend(this, SAILS_LOCALS);
    // this._marshalWindows();
  },

  //  ╔═╗╦  ╦╔═╗╔╗╔╔╦╗╔═╗
  //  ║╣ ╚╗╔╝║╣ ║║║ ║ ╚═╗
  //  ╚═╝ ╚╝ ╚═╝╝╚╝ ╩ ╚═╝
  methods: {}
});
