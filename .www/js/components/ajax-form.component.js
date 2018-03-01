'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Module dependencies
 */

// N/A


/**
 * <ajax-form>
 *
 * • If "action" is provided, then the "aterSubmit" event will be emitted,
 *   but the "submit" event will NOT be emitted.  And vice versa.
 *
 * • Also note that, if "action" is NOT provided, then `cloud-error` and
 *   "handle-parsing" props are ignored.
 *
 * @type {Component}
 */

parasails.registerComponent('ajaxForm', {

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠╣ ╠═╣║  ║╣
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╚  ╩ ╩╚═╝╚═╝
  props: ['syncing', 'action', 'handleParsing', 'cloudError'],

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Note:
  // Some of these props rely on the `.sync` modifier re-introduced in Vue 2.3.x.
  // For more info, see: https://vuejs.org/v2/guide/components.html#sync-Modifier
  //
  // Specifically, these special props are:
  // • syncing
  // • cloudError
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  //  ╔╦╗╔═╗╦═╗╦╔═╦ ╦╔═╗
  //  ║║║╠═╣╠╦╝╠╩╗║ ║╠═╝
  //  ╩ ╩╩ ╩╩╚═╩ ╩╚═╝╩
  template: '\n  <form class="ajax-form" @submit.prevent="submit()">\n    <slot name="default"></slot>\n  </form>\n  ',

  //  ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function data() {
    return {};
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function beforeMount() {},

  mounted: function mounted() {},

  beforeDestroy: function beforeDestroy() {},

  //  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  //  ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  //  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  methods: {

    submit: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _this = this;

        var argins, didResponseIndicateFailure, result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.syncing) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt('return');

              case 2:
                if (this.action) {
                  _context.next = 6;
                  break;
                }

                this.$emit('submit');
                _context.next = 32;
                break;

              case 6:
                if (_.isFunction(this.handleParsing)) {
                  _context.next = 8;
                  break;
                }

                throw new Error('If `action` is set, then `handle-parsing` should also be provided as a function!  For example: `:handle-parsing="handleParsingSomeForm"`.  This function should return a dictionary (plain JavaScript object) of "argins" -- that is, parsed form data, ready to be sent in a request to the server.');

              case 8:
                if (!(!_.isString(this.action) || !_.isFunction(Cloud[_.camelCase(this.action)]))) {
                  _context.next = 12;
                  break;
                }

                throw new Error('If `action` is set, it should be the name of a method on the `Cloud` global.  For example: `action="login"` would make this form communicate using `Cloud.login()`.');

              case 12:
                if (_.isFunction(Cloud[this.action])) {
                  _context.next = 14;
                  break;
                }

                throw new Error('Unrecognized `action` in <ajax-form>.  Did you mean to type `action="' + _.camelCase(this.action) + '"`?  (<ajax-form> expects `action` to be provided in camlCase format.  In other words, write an action from "api/controllers/foo/bar/do-something" as "doSomething".)');

              case 14:

                // Clear the userland "cloudError" prop.
                this.$emit('update:cloudError', '');

                // Run the provided "handle-parsing" logic.
                // > This clears out any pre-existing error messages, performs any additional client-side
                // > form validation checks, as well as any necessary data transformations to get the form
                // > data ready to be parsed as argins (and then eventually to be sent to the server.)
                _context.prev = 15;

                argins = this.handleParsing();
                _context.next = 22;
                break;

              case 19:
                _context.prev = 19;
                _context.t0 = _context['catch'](15);
                throw _context.t0;

              case 22:
                if (!(argins === undefined)) {
                  _context.next = 24;
                  break;
                }

                return _context.abrupt('return');

              case 24:
                if (!(!_.isObject(argins) || _.isArray(argins) || _.isFunction(argins))) {
                  _context.next = 26;
                  break;
                }

                throw new Error('Invalid data returned from custom form parsing logic.  (Should return a dictionary of argins, like `{}`.)');

              case 26:

                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                // FUTURE:
                // Parse and validate the provided data to ensure it's valid for this
                // cloud action.  (This also provides a basic level of client-side validation.)
                //
                // > See https://gist.github.com/mikermcneil/f0b7013998fd8c6f5c6aa79a7a9a298e
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

                // IWMIH, everything looks good.


                // Set syncing state to `true` on userland "syncing" prop.
                this.$emit('update:syncing', true);

                _context.next = 29;
                return Cloud[this.action](argins).tolerate(function (err) {
                  // When a cloud error occurs, tolerate it, but set the userland "cloudError" prop accordingly.
                  _this.$emit('update:cloudError', err.exit || 'error');
                  didResponseIndicateFailure = true;
                });

              case 29:
                result = _context.sent;


                // Set syncing state to `false` on userland "syncing" prop.
                this.$emit('update:syncing', false);

                // If the server says we were successful, then emit the "after-submitting" event.
                if (!didResponseIndicateFailure) {
                  this.$emit('after-submitting', result);
                }

              case 32:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[15, 19]]);
      }));

      function submit() {
        return _ref.apply(this, arguments);
      }

      return submit;
    }()

  }

});
