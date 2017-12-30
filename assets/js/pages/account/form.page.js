/**
 * Module dependencies
 */

// N/A

parasails.registerPage('form', {

  //  ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    me: {},
    submitMessage: '',
    syncing: {},
    mounted: false,
    oldFormObject: {

    },
    formObject:   {

    }

  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝

  // listedOnGithub, readyForSubmission, listed

  beforeMount: function (){
    _.extend(this, window.SAILS_LOCALS);
  },
  mounted: function(){
    this.oldFormObject = _.clone(this.formObject);
  },

  //  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  //  ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  //  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  methods: {
    toggleSubmission: async function(newValue) {

      var changes = {
        id: this.oldFormObject.id,
        status: newValue
      };

      this.syncing.status = true;

      var cloudError;
      var serverResponseData = await Cloud.saveForm(changes)
      .tolerate((err)=>{ cloudError = err; });

      if (cloudError) {
        // (FUTURE: have a think re error handling here, and what you want to do, if anything)
        throw err;
      } else {
        // console.log(`And re: "${attributeName}", the server says:`, serverResponseData);
      }

      _.extend(this.oldFormObject, serverResponseData);
      _.extend(this.formObject, serverResponseData);

      await parasails.require('pause')(1000);
      this.syncing.status = false;

      this.submitMessage = 'Your proposal must be manually reviewed by an administrator.  Once it\'s reviewed, it will be placed on Github where everyone is free to discuss it.  With enough supporters, it will then be approved and a chat room will be created for it.';
      await parasails.require('pause')(10000);
      this.submitMessage = '';

    },
    syncRemote: async function(attributeName, newFormObject, oldFormObject) {
      console.log(attributeName,'has changed from', oldFormObject[attributeName], 'to', newFormObject[attributeName]);

      var changes = {
        id: this.oldFormObject.id
      };

      changes[attributeName] = newFormObject[attributeName];

      this.syncing[attributeName] = true;

      var cloudError;
      var serverResponseData = await Cloud.saveForm(changes)
      .tolerate((err)=>{ cloudError = err; });

      if (cloudError) {
        // (FUTURE: have a think re error handling here, and what you want to do, if anything)
        throw err;
      } else {
        console.log(`And re: "${attributeName}", the server says:`, serverResponseData);
      }

      _.extend(this.oldFormObject, serverResponseData);
      _.extend(this.formObject, serverResponseData);

      await parasails.require('pause')(1000);

      this.syncing[attributeName] = false;
      this.$forceUpdate(); // (because vue.js doesn't seem to be aware of the change above)

    }

  }

});
