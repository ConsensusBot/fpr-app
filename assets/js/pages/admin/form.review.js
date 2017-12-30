/**
 * Module dependencies
 */

// N/A

parasails.registerPage('form-review', {

  //  ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    me: {},
    submitMessage: '',
    syncing: {
      status: ''
    },
    mounted: false,
    oldFormObject: {

    },
    formObject:   {

    }

  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝


  beforeMount: function (){
    _.extend(this, window.SAILS_LOCALS);
  },
  mounted: function(){
    this.oldFormObject = _.clone(this.formObject);
console.log('this',this.formObject);
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

      await parasails.require('pause')(1000);
      // this.syncing.status = false;

      this.submitMessage = 'This submission has been removed from the pool of pending FPRs.  The user will have to resubmit it.';
      await parasails.require('pause')(2500);
      this.submitMessage = '';

      // Now go pack to the pending FPR list
      window.location.href = '/system/pending';

    },
    syncRemote: async function(attributeName, newFormObject, oldFormObject) {
      console.log(attributeName,'has changed from', oldFormObject[attributeName], 'to', newFormObject[attributeName]);

      var changes = {
        id: this.oldFormObject.id
      };

      changes[attributeName] = newFormObject[attributeName];

      this.syncing[attributeName] = true;

      var cloudError;
      var serverResponseData = await Cloud.saveForm(changes).tolerate((err)=>{ cloudError = err; });

      if (cloudError) {
        // (FUTURE: have a think re error handling here, and what you want to do, if anything)
        throw err;
      }

      else {
        console.log(`And re: "${attributeName}", the server says:`, serverResponseData);
      }

      _.extend(this.oldFormObject, serverResponseData);
      _.extend(this.formObject, serverResponseData);

      await parasails.require('pause')(1000);

      this.syncing[attributeName] = false;
      this.$forceUpdate(); // (because vue.js doesn't seem to be aware of the change above)

    },
    adminApprove: async function(formObject) {

      this.submitMessage = 'Uploading FPR to Github on behalf of user';
      this.syncing.status = true;

      var cloudError;
      var serverResponseData = await Cloud.approvePendingFpr({formId: formObject.id}).tolerate((err)=>{ cloudError = err; });

      if (cloudError) {
        // (FUTURE: have a think re error handling here, and what you want to do, if anything)
        throw err;
      }

      else {
        console.log('Server Response:',serverResponseData);
      }

      await parasails.require('pause')(1000);
      this.submitMessage = '';

      // Now go pack to the pending FPR list
      window.location.href = '/system/pending';

    }
  }

});
