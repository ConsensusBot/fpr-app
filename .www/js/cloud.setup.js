"use strict";

/**
 * cloud.setup.js
 *
 * Configuration for the global SDK ("Cloud").
 *
 * Above all, the purpose of this file is to provide endpoint definitions,
 * each of which corresponds with one particular route+action on the server.
 *
 * > This file was automatically generated.
 * > (To regenerate, run `sails run rebuild-cloud-sdk`)
 */

Cloud.setup({

  /* eslint-disable */
  methods: { "viewSystemSettings": { "verb": "GET", "url": "/system" }, "viewPendingFprs": { "verb": "GET", "url": "/system/pending" }, "formReview": { "verb": "GET", "url": "/system/pending/:formId" }, "approvePendingFpr": { "verb": "POST", "url": "/system/pending/:formId" }, "allFprForms": { "verb": "GET", "url": "/forms" }, "loadForm": { "verb": "GET", "url": "/form" }, "saveForm": { "verb": "POST", "url": "/form" }, "viewSignup": { "verb": "GET", "url": "/signup" }, "confirmEmail": { "verb": "GET", "url": "/email/confirm" }, "viewForgotPassword": { "verb": "GET", "url": "/password/forgot" }, "viewNewPassword": { "verb": "GET", "url": "/password/new" }, "viewAccountOverview": { "verb": "GET", "url": "/account" }, "viewChangePassword": { "verb": "GET", "url": "/account/password" }, "viewEditProfile": { "verb": "GET", "url": "/account/profile" }, "logout": { "verb": "GET", "url": "/api/v1/account/logout" }, "updatePassword": { "verb": "PUT", "url": "/api/v1/account/update-password" }, "updateProfile": { "verb": "PUT", "url": "/api/v1/account/update-profile" }, "updateBillingCard": { "verb": "PUT", "url": "/api/v1/account/update-billing-card" }, "login": { "verb": "PUT", "url": "/api/v1/entrance/login" }, "signup": { "verb": "POST", "url": "/api/v1/entrance/signup" }, "sendPasswordRecoveryEmail": { "verb": "POST", "url": "/api/v1/entrance/send-password-recovery-email" }, "updatePasswordAndLogin": { "verb": "POST", "url": "/api/v1/entrance/update-password-and-login" }, "deliverContactFormMessage": { "verb": "POST", "url": "/api/v1/deliver-contact-form-message" }
    /* eslint-enable */

  } });
