/**
 * Module dependencies
 */

var flaverr = require('flaverr');
var parley = require('parley');
var stdlib = require('sails-stdlib').customize({ arginStyle: 'named', execStyle: 'deferred' });


/**
 * custom hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function defineCustomHook(sails) {

  return {

    /**
     * Runs when a Sails app loads/lifts.
     *
     * @param {Function} done
     */
    initialize: async function (done) {
      sails.after(['lifted'], ()=>{
        console.log('bro do you even lifted?');
      });

      sails.log.info('Initializing hook... (`api/hooks/custom`)');

      // Attach the `sails-stdlib` dependency on the app instance (`sails`), for convenience.
      sails.stdlib = stdlib;

      // Attach `sails.error`, for convenience.
      sails.error = flaverr;

      // Attach `sails.timer()`, for convenience.
      sails.timer = function setSailsTimer(ms) {
        // - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // Usage:
        // ```
        // await sails.timer(500);
        // console.log('timer went off!');
        // ```
        // - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // Or:
        // ```
        // var timer = sails.timer(500).exec(()=>{
        //   console.log('timer went off!');
        // });
        // //… (optionally:)
        // timer.clear();
        // ```
        // - - - - - - - - - - - - - - - - - - - - - - - - - - -
        if (ms !== undefined && (!_.isNumber(ms) || ms < 0)) {
          throw new Error('Invalid usage of `sails.timer`: If specified, expected argument to be the number of milliseconds to pause, but instead got: '+ms);
        }

        var timeoutId;
        var status = 'pending';//pending,finished,cleared
        var fullTrace = flaverr.getBareTrace(setSailsTimer);
        var partialTrace = flaverr.getBareTrace(setSailsTimer, 1);

        // A Timer is built from a Deferred.
        var timer = parley((done)=>{
          timeoutId = setTimeout(()=>{
            if (status !== 'pending') { throw new Error('Consistency violation: This should never happen!'); }
            status = 'finished';
            done();
          }, ms||0);
        }, undefined, {
          getStatus: function(){
            return status;
          },
          logTrace: function(){
            console.log(fullTrace);
          },
          clear: function(){
            if (status !== 'pending') { return; }// idempotent
            status = 'cleared';
            clearTimeout(timeoutId);
          }
        });
        Object.defineProperty(timer, '_isSailsTimer', { enumerable: false, configurable: false, writable: false, value: true });
        Object.defineProperty(timer, 'toString', { enumerable: false, configurable: false, writable: false, value: function (){
          return '[Timer]';
        } });
        Object.defineProperty(timer, 'inspect', { enumerable: false, configurable: false, writable: false, value: function (){
          return `Timer started with sails.timer() ${partialTrace.replace(/^\s+/,'')}
Call \`.clear()\` to cancel, or \`.getStatus()\` to check if it is "cleared", "finished", or "pending".
(Call \`.logTrace\` for more information on this timer's origin.)`;
        } });
        return timer;
      };//ƒ


      // Check Mailgun configuration (for emails).
      var MANDATORY_MAILGUN_CONFIG = ['mailgunApiKey', 'mailgunDomain', 'internalEmailAddress'];
      var isMissingMailgunConfig = _.difference(MANDATORY_MAILGUN_CONFIG, Object.keys(sails.config.custom)).length > 0;

      if (isMissingMailgunConfig) {
        let verboseSuffix = '';
        if (_.includes(['verbose', 'silly'], sails.config.log.level)) {
          verboseSuffix =
`
> Tip: To exclude sensitive credentials from source control, use:
> • config/local.js (for local development)
> • environment variables (for production)
>
> If you want to check them in to source control, use:
> • config/custom.js  (for development)
> • config/env/staging.js  (for staging)
> • config/env/production.js  (for production)
>
> (See https://sailsjs.com/docs/concepts/configuration for help configuring Sails.)
`;
        }

        let problems = [];
        if (sails.config.custom.mailgunApiKey === undefined) {
          problems.push('No `sails.config.custom.mailgunApiKey` was configured.');
        }
        if (sails.config.custom.mailgunDomain === undefined) {
          problems.push('No `sails.config.custom.mailgunDomain` was configured.');
        }
        if (sails.config.custom.internalEmailAddress === undefined) {
          problems.push('No `sails.config.custom.internalEmailAddress` was configured.');
        }

        sails.log.warn(
`Some optional settings have not been configured yet:
---------------------------------------------------------------------
${problems.join('\n')}

Until this is resolved, this app's email features
will be disabled and/or hidden in the UI.

 [?] If you're unsure, come by https://sailsjs.com/support
---------------------------------------------------------------------${verboseSuffix}`);
      }//ﬁ

      // Set additional config keys based on whether Mailgun config is available.
      // These will determine whether or not to enable various email features.
      sails.config.custom.enableEmailFeatures = !isMissingMailgunConfig;

      // Always set up Mailgun credentials on load, no matter what.
      await sails.stdlib('mailgun').configure({
        apiKey: sails.config.custom.mailgunApiKey,
        domain: sails.config.custom.mailgunDomain,
      });

      // ... Any other app-specific setup code that needs to run on lift,
      // even in production, goes here ...

      return done();

    },


    routes: {

      /**
       * Runs before every matching route.
       *
       * @param {Ref} req
       * @param {Ref} res
       * @param {Function} next
       */
      before: {
        '/*': {
          skipAssets: true,
          fn: async function(req, res, next){

            // First, if this is a GET request (and thus potentially a view),
            // attach an `_environment` local.
            // > (This allows us to do our little workaround to make Vue.js
            // > run in "production mode" without unnecessarily involving
            // > complexities with webpack et al.)
            if (req.method === 'GET') {
              if (res.locals._environment !== undefined) {
                throw new Error('Cannot attach Sails environment as the view local `_environment`, because this view local already exists!  (Is it being attached somewhere else?)');
              }
              res.locals._environment = sails.config.environment;

            }//ﬁ

            // Set up the `setFlash` function that allows setting a flash var before redirecting.
            res.setFlash = function (key, val) {
              res.cookie('__flash_' + key, val.toString());
            };

            // If there are any `__flash_` cookies, put them in `req.flash` and delete them.
            req.flash = _.reduce(req.cookies, function (memo, val, key) {
              if (key.indexOf('__flash_') === 0) {
                memo[key.substr(8)] = val;
                res.cookie(key, '', {expires: new Date(0)});
              }
              return memo;
            }, {});

            // No session? Proceed as usual.
            // (e.g. request for a static asset)
            if (!req.session) { return next(); }

            // Not logged in? Proceed as usual.
            if (!req.session.userId) { return next(); }

            // Otherwise, look up the logged-in user.
            var loggedInUser = await User.findOne({
              id: req.session.userId
            }).decrypt();

            // If the logged-in user has gone missing, log a warning,
            // wipe the user id from the requesting user agent's session,
            // and then send the "unauthorized" response.
            if (!loggedInUser) {
              sails.log.warn('Somehow, the user record for the logged-in user (`'+req.session.userId+'`) has gone missing....');
              delete req.session.userId;
              return res.unauthorized();
            }

            // Add additional information for convenience when building top-level navigation.
            // (i.e. whether to display "Dashboard", "My Account", etc.)
            if (!loggedInUser.password || loggedInUser.emailStatus === 'pending') {
              loggedInUser.dontDisplayAccountLinkInNav = true;
            }

            // Expose the user record as an extra property on the request object (`req.me`).
            // > Note that we make sure `req.me` doesn't already exist first.
            if (req.me !== undefined) {
              throw new Error('Cannot attach logged-in user as `req.me` because this property already exists!  (Is it being attached somewhere else?)');
            }
            req.me = loggedInUser;

            // If our "lastSeenAt" attribute for this user is at least a few seconds old, then set it
            // to the current timestamp.
            //
            // (Note: As an optimization, this is run behind the scenes to avoid adding needless latency.)
            var MS_TO_BUFFER = 60*1000;
            var now = Date.now();
            if (loggedInUser.lastSeenAt < now - MS_TO_BUFFER) {
              User.update({id: loggedInUser.id})
              .set({ lastSeenAt: now })
              .exec((err)=>{
                if (err) {
                  sails.log.error('Background task failed: Could not update user (`'+loggedInUser.id+'`) with a new `lastSeenAt` timestamp.  Error details: '+err.stack);
                  return;
                }//•
                sails.log.verbose('Updated the `lastSeenAt` timestamp for user `'+loggedInUser.id+'`.');
                // Nothing else to do here.
              });//_∏_  (Meanwhile...)
            }//ﬁ


            // If this is a GET request, then also expose an extra view local (`<%= me %>`).
            // > Note that we make sure a local named `me` doesn't already exist first.
            // > Also note that we strip off any properties that correspond with protected attributes.
            if (req.method === 'GET') {
              if (res.locals.me !== undefined) {
                throw new Error('Cannot attach logged-in user as the view local `me`, because this view local already exists!  (Is it being attached somewhere else?)');
              }

              // Exclude any fields corresponding with attributes that have `protect: true`.
              var sanitizedUser = _.extend({}, loggedInUser);
              for (let attrName in User.attributes) {
                if (User.attributes[attrName].protect) {
                  delete sanitizedUser[attrName];
                }
              }//∞

              // If there is still a "password" in sanitized user data, then delete it just to be safe.
              // (But also log a warning so this isn't hopelessly confusing.)
              if (sanitizedUser.password) {
                sails.log.warn('The logged in user record has a `password` property, but it was still there after pruning off all properties that match `protect: true` attributes in the User model.  So, just to be safe, removing the `password` property anyway...');
                delete sanitizedUser.password;
              }//ﬁ

              res.locals.me = sanitizedUser;

              // Include information on the locals as to whether email
              // features are enabled for this app.
              res.locals.isEmailEnabled = sails.config.custom.enableEmailFeatures;

            }//ﬁ

            // Prevent the browser from caching logged-in users' pages.
            //
            // > (including w/ the Chrome back button)
            // > See https://mixmax.com/blog/chrome-back-button-cache-no-store
            // >
            // > Note that we don't go this far (and hopefully won't ever have to):
            // > https://madhatted.com/2013/6/16/you-do-not-understand-browser-history)
            res.setHeader('Cache-Control', 'no-cache, no-store');

            return next();
          }
        }
      }
    }


  };

};
