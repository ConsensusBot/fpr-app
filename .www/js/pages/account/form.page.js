'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
    oldFormObject: {},
    submissionWarning: '',
    formObject: {},
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
    formTrueOrFalse: {
      projectName: '',
      startDate: '',
      hashtag: '',
      stakeholders: '',
      projectSummary: '',
      resources: '',
      budget: '',
      timeline: '',
      goals: ''
    }

  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝

  // listedOnGithub, readyForSubmission, listed

  beforeMount: function beforeMount() {
    _.extend(this, window.SAILS_LOCALS);
    console.log('SAILS LOCALS:', window.SAILS_LOCALS);
  },
  mounted: function mounted() {
    this.oldFormObject = _.clone(this.formObject);
  },

  //  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  //  ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  //  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  methods: {

    toggleSubmission: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(newValue) {
        var arr, lookupString, unfilled, i, addLast, addFirstArr, addFirstStr, changes, cloudError, serverResponseData;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:

                delete this.formObject.chatName;
                delete this.oldFormObject.chatName;

                if (this.formObject.projectName && this.formObject.startDate && this.formObject.hashtag && this.formObject.stakeholders && this.formObject.projectSummary && this.formObject.resources && this.formObject.budget && this.formObject.timeline && this.formObject.goals) {
                  // console.log('filled in!');
                  this.filledStatus = true;
                } else {
                  // console.log('not filled in!');
                  this.filledStatus = false;
                }

                if (!(this.formObject.status === 'draft' && !this.filledStatus)) {
                  _context.next = 12;
                  break;
                }

                console.log('the form may NOT be submitted');

                arr = Object.keys(this.formObject); //store names of formObject

                lookupString = '';
                unfilled = [];


                for (i = 3; i < 12; i++) {
                  //check only the fields we're looking for (so between 3 and 11),
                  lookupString = arr[i];
                  if (!this.formObject[lookupString]) {
                    //find the unfilled bits and put them into var unfilled
                    unfilled.push(lookupString);
                    this.formTrueOrFalse[lookupString] = 'is-invalid';
                  }

                  if (this.formObject[lookupString]) {
                    this.formTrueOrFalse[lookupString] = 'is-valid';
                  }
                }

                if (unfilled.length > 1) {

                  console.log(unfilled);

                  addLast = unfilled.pop();
                  addFirstArr = [];


                  for (i = 0; i < unfilled.length; i++) {
                    addFirstArr.push(this.formFriendlyNames[unfilled[i]]);
                  }

                  addFirstStr = addFirstArr.join('</span>, <span class="text-danger">');


                  this.filledOrNot = 'All your progress has been saved but you may not submit this FPR for review without the following fields: <span class="text-danger">' + addFirstStr + '</span> and ' + '<span class="text-danger">' + this.formFriendlyNames[addLast] + '</span>.';
                } else if (unfilled.length === 1) {
                  //check how many fields are unfilled and put them into a message for the user
                  this.filledOrNot = 'All your progress has been saved but you may not submit this FPR for review without the following field <span class="text-danger">' + this.formFriendlyNames[unfilled] + '</span>';
                }

                _context.next = 57;
                break;

              case 12:
                if (!(this.formObject.status === 'draft' && this.filledStatus)) {
                  _context.next = 36;
                  break;
                }

                console.log('it is filled');

                //saving section TODO: tidy this up, could be a better way so that this saving code isn't written out twice **
                changes = {
                  id: this.oldFormObject.id,
                  status: newValue
                };


                this.syncing.status = true;

                _context.next = 18;
                return Cloud.saveForm(changes).tolerate(function (err) {
                  cloudError = err;
                });

              case 18:
                serverResponseData = _context.sent;

                if (!cloudError) {
                  _context.next = 23;
                  break;
                }

                throw err;

              case 23:

                _.extend(this.oldFormObject, serverResponseData);
                _.extend(this.formObject, serverResponseData);

                _context.next = 27;
                return parasails.require('pause')(1000);

              case 27:
                this.syncing.status = false;
                //**

                this.hidden = true;
                this.submitMessage = 'Thank you for submitting your proposal to the Bitcoin Cash Fund. We aim to provide a response within 48 hours. You can track your proposal here... <br><br> <a href="https://github.com/The-Bitcoin-Cash-Fund/FPR/pulls">https://github.com/The-Bitcoin-Cash-Fund/FPR/pulls</a><br><br>In the meantime, join us in our live chat at <a href="https://chat.thebitcoincash.fund">https://chat.thebitcoincash.fund</a> to discuss your project and all things Bitcoin Cash.<br><br>See you in there!';
                _context.next = 32;
                return parasails.require('pause')(12000);

              case 32:
                this.submitMessage = '';
                this.hidden = false;

                _context.next = 57;
                break;

              case 36:
                if (!(this.formObject.status === 'pending')) {
                  _context.next = 57;
                  break;
                }

                changes = {
                  id: this.oldFormObject.id,
                  status: newValue
                };


                this.syncing.status = true;

                _context.next = 41;
                return Cloud.saveForm(changes).tolerate(function (err) {
                  cloudError = err;
                });

              case 41:
                serverResponseData = _context.sent;

                if (!cloudError) {
                  _context.next = 46;
                  break;
                }

                throw err;

              case 46:

                _.extend(this.oldFormObject, serverResponseData);
                _.extend(this.formObject, serverResponseData);

                _context.next = 50;
                return parasails.require('pause')(1000);

              case 50:
                this.syncing.status = false;

                this.hidden = true;
                this.submitMessage = 'Your submission has been withdrawn.';
                _context.next = 55;
                return parasails.require('pause')(2000);

              case 55:
                this.submitMessage = '';
                this.hidden = false;

              case 57:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function toggleSubmission(_x) {
        return _ref.apply(this, arguments);
      }

      return toggleSubmission;
    }(),

    syncRemote: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(attributeName, newFormObject, oldFormObject, formTrueOrFalse) {
        var changes, cloudError, serverResponseData;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                console.log(attributeName, 'has changed from', oldFormObject[attributeName], 'to', newFormObject[attributeName]);

                if (this.formObject[attributeName]) {
                  this.formTrueOrFalse[attributeName] = 'is-valid';
                } else if (!this.formObject[attributeName]) {
                  this.formTrueOrFalse[attributeName] = 'is-invalid';
                }

                changes = {
                  id: this.oldFormObject.id
                };


                changes[attributeName] = newFormObject[attributeName];

                this.syncing[attributeName] = true;

                _context2.next = 7;
                return Cloud.saveForm(changes).tolerate(function (err) {
                  cloudError = err;
                });

              case 7:
                serverResponseData = _context2.sent;

                if (!cloudError) {
                  _context2.next = 12;
                  break;
                }

                throw err;

              case 12:
                console.log('And re: "' + attributeName + '", the server says:', serverResponseData);

              case 13:

                _.extend(this.oldFormObject, serverResponseData);
                _.extend(this.formObject, serverResponseData);

                _context2.next = 17;
                return parasails.require('pause')(1000);

              case 17:

                this.syncing[attributeName] = false;
                this.$forceUpdate(); // (because vue.js doesn't seem to be aware of the change above)

              case 19:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function syncRemote(_x2, _x3, _x4, _x5) {
        return _ref2.apply(this, arguments);
      }

      return syncRemote;
    }()
  }

});
