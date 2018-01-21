/**
 * User.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  migrate: 'alter',

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    emailAddress: {
      type: 'string',
      // required: true,
      // unique: true,
      encrypt: true,
      isEmail: true,
      maxLength: 200
      // e.g. "carol.reyna@microsoft.com"
    },

    password: {
      type: 'string',
      // required: true,
      protect: true,
      // e.g. "2$28a8eabna301089103-13948134nad"
    },

    fullName: {
      type: 'string',
      // required: true,
      description: 'Full representation of the user\'s name',
      maxLength: 120
      // e.g. 'Microwave Jenny',
    },

    isSuperAdmin: {
      type: 'boolean'
    },

    passwordResetToken: {
      type: 'string'
    },

    passwordResetTokenExpiresAt: {
      type: 'number',
    },

    emailProofToken: {
      type: 'string'
    },

    emailProofTokenExpiresAt: {
      type: 'number',
    },

    emailStatus: {
      type: 'string',
      isIn: ['pending', 'changed', 'confirmed'],
      defaultsTo: 'confirmed'
      // The confirmation status of the user's email.  Users created via invites already have "confirmed" addresses,
      // since they need to click an email link in order to complete signup (because they don't have passwords yet).
      // New users created via the signup form have "pending" emails until they click the confirmation email.
      // Existing users who want to change their email address have "changed" email status until they click
      // the  confirmation email.
    },

    emailChangeCandidate: {
      type: 'string'
      // The (unconfirmed) email address that an existing user wants to change to.
    },

    tosAcceptedByIp: {
      type: 'string',
      // The IP (ipv4) address of the request that accepted the terms of service
    },

    lastSeenAt: {
      type: 'number',
      description: 'The moment at which this user most recently interacted with the backend while logged in.',
      // e.g. 1502844074211
    },

    signupComplete: {
      type: 'boolean'
    },

    githubLogin: {
      type: 'string',
      // The github username of our user
    },

    githubUserData: {
      type: 'json',
      example: {
        'login':'alwaysAn0n',
        'id':34048172,
        'avatar_url':'https://avatars3.githubusercontent.com/u/34048172?v=4',
        'url':'https://api.github.com/users/alwaysAn0n',
        'html_url':'https://github.com/alwaysAn0n',
        'followers_url':'https://api.github.com/users/alwaysAn0n/followers',
        'following_url':'https://api.github.com/users/alwaysAn0n/following{/other_user}',
        'gists_url':'https://api.github.com/users/alwaysAn0n/gists{/gist_id}',
        'starred_url':'https://api.github.com/users/alwaysAn0n/starred{/owner}{/repo}',
        'subscriptions_url':'https://api.github.com/users/alwaysAn0n/subscriptions',
        'organizations_url':'https://api.github.com/users/alwaysAn0n/orgs',
        'repos_url':'https://api.github.com/users/alwaysAn0n/repos',
        'events_url':'https://api.github.com/users/alwaysAn0n/events{/privacy}',
        'received_events_url':'https://api.github.com/users/alwaysAn0n/received_events',
        'type':'User',
        'location':null,
        'email':null
      }
    },

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    githubOauthToken: {
      model: 'Token'
    },
    fprs: {
      collection: 'FundingProposal'
    }

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝
    // n/a
  },


};
