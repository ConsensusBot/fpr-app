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

    },
    hidden: false,
    filledOrNot: '',
    filledStatus: undefined


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



      if (this.formObject.projectName && this.formObject.startDate && this.formObject.hashtag && this.formObject.stakeholders && this.formObject.projectSummary && this.formObject.resources && this.formObject.budget && this.formObject.timeline && this.formObject.goals) {
        // console.log('filled in!');
        this.filledStatus = true;
      } else {
        // console.log('not filled in!');
        this.filledStatus = false;
      }


      if (this.formObject.status === 'draft' && (!this.filledStatus)) {
        console.log('the form may NOT be submitted');
        this.filledOrNot = 'You must fill all required sections of the form to submit';
      } else if (this.formObject.status === 'draft' && (this.filledStatus)) {
        console.log('it is filled');

        //saving section TODO: tidy this up, could be a better way so that this saving code isn't written out twice **
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
        //**

        this.hidden = true;
        this.submitMessage = 'Thank you for submitting your proposal to the Bitcoin Cash Fund. We aim to provide a response within 48 hours. You can track your proposal here... <br><br> <a href="https://github.com/The-Bitcoin-Cash-Fund/FPR/pulls">https://github.com/The-Bitcoin-Cash-Fund/FPR/pulls</a><br><br>In the meantime, join us in our live chat at <a href="https://chat.thebitcoincash.fund">https://chat.thebitcoincash.fund</a> to discuss your project and all things Bitcoin Cash.<br><br>See you in there!';
        await parasails.require('pause')(12000);
        this.submitMessage = '';
        this.hidden = false;

      } else if (this.formObject.status === 'pending')  {

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

        this.hidden = true;
        this.submitMessage = 'Your submission has been withdrawn.';
        await parasails.require('pause')(2000);
        this.submitMessage = '';
        this.hidden = false;
      }
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
