'use strict';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// UPDATE:
//
// If you're using a Sails app, and you need to do this on the backend, then instead of the code below,
// consider just using `sails.helpers.flow.pause()` from sails-hook-organics.
// (Now available by default in the "Web App" template.)
//
//
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


/**
 * pause()
 *
 * Pause for the specified number of milliseconds.
 *
 * ```
 * var pause = parasails.require('pause');
 *
 * // Wait 2 seconds
 * await pause(2000);
 * ```
 *
 * > This is just a simple wrapper around setTimeout().
 * > It _cannot_ be canceled.  If you need to cancel this timer,
 * > then just use the native setTimeout() instead.
 * -----------------------------------------------------------------
 * @param {Number} ms
 * -----------------------------------------------------------------
 */

parasails.registerUtility('pause', function (ms) {

  // This silly Promise stuff is just a way to do a cheap, pretend version
  // of what `parley` does without having to browserify parley and bring it in.
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, ms);
  });
});
