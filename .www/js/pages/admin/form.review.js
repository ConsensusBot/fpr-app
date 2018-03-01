'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
    oldFormObject: {},
    formObject: {}

  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝


  beforeMount: function beforeMount() {
    _.extend(this, window.SAILS_LOCALS);
  },
  mounted: function mounted() {
    this.oldFormObject = _.clone(this.formObject);
    console.log('this', this.formObject);
  },

  //  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  //  ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  //  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  methods: {
    toggleSubmission: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(newValue) {
        var changes, cloudError, serverResponseData;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                changes = {
                  id: this.oldFormObject.id,
                  status: newValue
                };


                this.syncing.status = true;

                _context.next = 4;
                return Cloud.saveForm(changes).tolerate(function (err) {
                  cloudError = err;
                });

              case 4:
                serverResponseData = _context.sent;

                if (!cloudError) {
                  _context.next = 9;
                  break;
                }

                throw err;

              case 9:
                _context.next = 11;
                return parasails.require('pause')(1000);

              case 11:
                // this.syncing.status = false;

                this.submitMessage = 'This submission has been removed from the pool of pending FPRs.  The user will have to resubmit it.';
                _context.next = 14;
                return parasails.require('pause')(2500);

              case 14:
                this.submitMessage = '';

                // Now go pack to the pending FPR list
                window.location.href = '/system/pending';

              case 16:
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
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(attributeName, newFormObject, oldFormObject) {
        var changes, cloudError, serverResponseData;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                console.log(attributeName, 'has changed from', oldFormObject[attributeName], 'to', newFormObject[attributeName]);

                changes = {
                  id: this.oldFormObject.id
                };


                changes[attributeName] = newFormObject[attributeName];

                this.syncing[attributeName] = true;

                _context2.next = 6;
                return Cloud.saveForm(changes).tolerate(function (err) {
                  cloudError = err;
                });

              case 6:
                serverResponseData = _context2.sent;

                if (!cloudError) {
                  _context2.next = 11;
                  break;
                }

                throw err;

              case 11:
                console.log('And re: "' + attributeName + '", the server says:', serverResponseData);

              case 12:

                _.extend(this.oldFormObject, serverResponseData);
                _.extend(this.formObject, serverResponseData);

                _context2.next = 16;
                return parasails.require('pause')(1000);

              case 16:

                this.syncing[attributeName] = false;
                this.$forceUpdate(); // (because vue.js doesn't seem to be aware of the change above)

              case 18:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function syncRemote(_x2, _x3, _x4) {
        return _ref2.apply(this, arguments);
      }

      return syncRemote;
    }(),
    adminApprove: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(formObject) {
        var cloudError, serverResponseData;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:

                this.submitMessage = 'Uploading FPR to Github on behalf of user';
                this.syncing.status = true;

                _context3.next = 4;
                return Cloud.approvePendingFpr({ formId: formObject.id }).tolerate(function (err) {
                  cloudError = err;
                });

              case 4:
                serverResponseData = _context3.sent;

                if (!cloudError) {
                  _context3.next = 9;
                  break;
                }

                throw err;

              case 9:
                console.log('Server Response:', serverResponseData);

              case 10:
                _context3.next = 12;
                return parasails.require('pause')(1000);

              case 12:
                this.submitMessage = '';

                // Now go pack to the pending FPR list
                window.location.href = '/system/pending';

              case 14:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function adminApprove(_x5) {
        return _ref3.apply(this, arguments);
      }

      return adminApprove;
    }()
  }

});
