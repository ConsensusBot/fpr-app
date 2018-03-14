/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Sails/Express middleware to run for every HTTP request.                   *
  * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
  *                                                                           *
  * https://sailsjs.com/documentation/concepts/middleware                     *
  *                                                                           *
  ****************************************************************************/

  middleware: {

    redirectToHTTPS: (req, res, next) => {
      if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https'){
        res.redirect(`https://${req.header('host')}${req.url}`);
      }
      else {
        return next();
      }
    },
    
    i18nPath: (req, res, next) => {
        var debug = require('debug')('i18npath');
        
        // Find a matching prefix
        var matchedLocale;
        for (let locale of sails.config.i18n.locales) {
            var prefix = "/" + locale;
            if (req.path == prefix || req.path.startsWith(prefix + "/")) {
                matchedLocale = locale
                break;
            }
        }
        
        // Apply rewrite if matched
        if (matchedLocale) {
            // Remote the i18n path so that routers continue to match
            req.url = "/" + req.url.substring(matchedLocale.length + 2);
            debug("rewriting [" + matchedLocale + "] " + req.url);
            
            // Handle redirects to keep the i18n path
            res.redirect = (function(redirect, locale) {
                return function(url) {
                    if (url.match(/^https?:/i)) {
                        debug("redirecting absolute url " + url);
                        return redirect(url);
                    }
                    else {
                        debug("redirecting [" + locale + "] " + url);
                        return redirect('/' + locale + url);
                    }
                };
            })(res.redirect.bind(res), matchedLocale);
        }

        // We always set a fixed locale (English by default).
        req.query.lang = matchedLocale || "en";

        // Needed to override the internal logic that always
        // defaults to the preferred language in the headers.
        req.headers["accept-language"] = matchedLocale || "en";

        // Set request property to help build urls
        req.i18nPath = "/" + (matchedLocale || "en");
        
        return next();
    },

    /***************************************************************************
    *                                                                          *
    * The order in which middleware should be run for HTTP requests.           *
    * (This Sails app's routes are handled by the "router" middleware below.)  *
    *                                                                          *
    ***************************************************************************/

    order: [
      'redirectToHTTPS',
      'cookieParser',
      'session',
      'bodyParser',
      'compress',
      'poweredBy',
      'i18nPath',
      'router',
      'www',
      'favicon',
    ],


    /***************************************************************************
    *                                                                          *
    * The body parser that will handle incoming multipart HTTP requests.       *
    *                                                                          *
    * https://sailsjs.com/config/http#?customizing-the-body-parser             *
    *                                                                          *
    ***************************************************************************/

    // bodyParser: (function _configureBodyParser(){
    //   var skipper = require('skipper');
    //   var middlewareFn = skipper({ strict: true });
    //   return middlewareFn;
    // })(),

  },

};
