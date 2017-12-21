/**
 * Module dependencies
 */

// N/A

parasails.registerPage('all-fpr-forms', {

  //  ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    me: {},
    forms: {},
    formObject:   {

      projectName: '',
      startDate: '',
      hashtag: '',
      bcfName: '',
      stakeholders: '',
      projectSummary: '',
      resources: '',
      budget: '',
      timeline: '',
      goals: '',
      other: ''

    }

  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝

  beforeMount: function (){
    _.extend(this, window.SAILS_LOCALS);
  },

  mounted: function(){


  },

  //  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  //  ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  //  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  methods: {

    submitButton: function()  {

      io.socket.post('/fundingproposal', {
        projectName: this.formObject.projectName,
        startDate: this.formObject.startDate,
        hashtag: this.formObject.hashtag,
        bcfName: this.formObject.bcfName,
        stakeholders: this.formObject.stakeholders,
        projectSummary: this.formObject.projectSummary,
        resources: this.formObject.resources,
        budget: this.formObject.budget,
        timeline: this.formObject.timeline,
        goals: this.formObject.goals,
        other: this.formObject.other
      }, function (resData, jwRes) {
        jwRes.statusCode; // => 200
      });

    }

  }

});
