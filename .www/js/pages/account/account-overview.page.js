'use strict';

/**
 * Module dependencies
 */

// N/A


parasails.registerPage('account-overview', {

  //  ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {

    me: {/* ... */},

    isBillingEnabled: false,

    hasBillingCard: false,

    // Main syncing/loading state for this page.
    syncing: false,

    // Form data
    formData: {/* … */},

    // For tracking error submitting the Stripe checkout form.
    stripeError: false,

    // Server error state for the form
    cloudError: '',

    // For the Stripe checkout window
    checkoutHandler: undefined
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function beforeMount() {
    _.extend(this, window.SAILS_LOCALS);

    this.isBillingEnabled = !!this.stripePublishableKey;

    // Determine whether there is billing info for this user.
    this.hasBillingCard = this.me.billingCardBrand && this.me.billingCardLast4 && this.me.billingCardExpMonth && this.me.billingCardExpYear;

    // Initialize the stripe checkout handler, if billing is configured for this app.
    if (this.isBillingEnabled) {
      this.checkoutHandler = StripeCheckout.configure({
        // (The publishable key was passed down for this view via SAILS_LOCALS.)
        key: this.stripePublishableKey
      });
    }
  },

  //  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  //  ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  //  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  methods: {

    clickStripeCheckoutButton: function clickStripeCheckoutButton() {
      var _this = this;

      // Prevent double-posting if it's still loading.
      if (this.syncing) {
        return;
      }

      // Clear out error states.
      this.stripeError = false;
      this.cloudError = false;

      // Open Stripe checkout.
      this.checkoutHandler.open({
        name: 'NEW_APP_NAME',
        description: 'Link your credit card.',
        panelLabel: 'Save card',
        email: this.me.emailAddress,
        locale: 'auto',
        zipCode: true,
        allowRememberMe: false,

        // After payment info has been successfully added:
        token: function token(stripeData) {
          // If there were any issues, flag our stripe error and don't submit.
          if (!stripeData.id) {
            _this.stripeError = true;
            return;
          }

          // Update the card info for this user.
          _this.syncing = true;
          Cloud.updateBillingCard({
            stripeToken: stripeData.id,
            billingCardLast4: stripeData.card.last4,
            billingCardBrand: stripeData.card.brand,
            billingCardExpMonth: stripeData.card.exp_month,
            billingCardExpYear: stripeData.card.exp_year
          }).exec(function (err) {
            _this.syncing = false;
            if (err) {
              _this.cloudError = true;
              return;
            }

            // Update billing info on success.
            _this.me.billingCardLast4 = stripeData.card.last4;
            _this.me.billingCardBrand = stripeData.card.brand;
            _this.me.billingCardExpMonth = '' + stripeData.card.exp_month;
            _this.me.billingCardExpYear = '' + stripeData.card.exp_year;
            _this.hasBillingCard = true;
          }); //_∏_
        }

      });
    }

  }

});
