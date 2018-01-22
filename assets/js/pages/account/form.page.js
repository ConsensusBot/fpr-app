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
    filledStatus: undefined,

    formFriendlyNames: {
      projectName: 'Project Name',
      startDate: 'Start Date',
      hashtag: 'Hashtag',
      stakeholders: 'Stakeholders',
      projectSummary: 'Project Summery',
      resources: 'Resources',
      budget: 'Budget',
      timeline: 'Timeline',
      goals: 'Goals'
    },

  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝

  // listedOnGithub, readyForSubmission, listed

  beforeMount: function (){
    _.extend(this, window.SAILS_LOCALS);
    delete this.formObject.chatName;
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


        var arr = Object.keys(this.formObject); //store names of formObject

        var lookupString = '';

        var unfilled = [];

        for (var i = 3; i < 12; i++) { //check only the fields we're looking for (so between 3 and 11),
          lookupString = arr[i];
          if (this.formObject[lookupString] === '') { //find the unfilled bits and put them into var unfilled
            unfilled.push(lookupString);
          }
        }

        if (unfilled.length > 1) {

          console.log(unfilled);

          var addLast = unfilled.pop();

          var addFirstArr = [];

          for (var i = 0; i < unfilled.length; i++) {
            addFirstArr.push(this.formFriendlyNames[unfilled[i]]); //think i need to first put each property into an array then convert it into it's friendly name
          }

          var addFirstStr = addFirstArr.join('</span>, <span class="text-danger">');

          this.filledOrNot = 'You must fill in the following text-boxes before the form can be submitted: <span class="text-danger">' + addFirstStr + '</span> and ' + '<span class="text-danger">' + this.formFriendlyNames[addLast] + '</span>.';

        } else if (unfilled.length === 1){ //check how many fields are unfilled and put them into a message for the user
          this.filledOrNot = 'You must fill in the <span class="text-danger">' + this.formFriendlyNames[unfilled] + '</span> text-box before the form can be submitted';

        }

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
