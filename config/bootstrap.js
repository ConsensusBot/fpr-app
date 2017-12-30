/**
 * Module dependencies
 */
var path = require('path');
var fs = require('fs');

var flaverr = require('flaverr');

var FAKE_DATA = {
};

/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = async function(done) {

  //  ╔═╗┌─┐┌┬┐┬ ┬┌─┐  ┌┐ ┌─┐┌─┐┌┬┐┌─┐┌┬┐┬─┐┌─┐┌─┐
  //  ╚═╗├┤  │ │ │├─┘  ├┴┐│ ││ │ │ └─┐ │ ├┬┘├─┤├─┘
  //  ╚═╝└─┘ ┴ └─┘┴    └─┘└─┘└─┘ ┴ └─┘ ┴ ┴└─┴ ┴┴

  // This bootstrap version indicates what version of fake data we're dealing with here.
  var BOOTSTRAP_VERSION_IN_CODE_BASE = 1;

  // This path indicates where to store/look for the JSON file that tracks the "last run bootstrap info"
  // locally on this development computer (if we happen to be on a development computer).
  var bootstrapLastRunInfoPath = path.resolve(sails.config.appPath, '.tmp/bootstrap-version.json');

  // Attach `sails.error`, for convenience.
  sails.error = flaverr;

  // Whether or not to continue doing the stuff in this file (i.e. wiping and regenerating data)
  // depends on some factors:
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  // A flag to always be able to skip the bootstrap, no matter what
  if (sails.config.skipBootstrap) {
    return done();
  }//•


  // The checks below can be completely bypassed by setting `--drop` or `--environment=test`.
  if (sails.config.models.migrate === 'drop' || sails.config.environment === 'test') {
    sails.log('Running bootstrap script because it was forced...  (either `--drop` or `--environment=test` was used)');
  }
  // But otherwise, they run.
  else {

    // If this is _actually_ a production environment (real or simulated), prevent accidentally removing all data!
    if (process.env.NODE_ENV==='production') {
      sails.log.warn('Since we are running with NODE_ENV=production (& with the "'+sails.config.environment+'" Sails environment, to be precise), skipping the rest of the bootstrap to avoid data loss...');
      return done();
    }//•

    // Compare bootstrap version from code base to the version that was last run
    var lastRunBootstrapInfo;
    try {
      lastRunBootstrapInfo = JSON.parse(fs.readFileSync(bootstrapLastRunInfoPath, 'utf8'));
    } catch (e) {
      if (e.code === 'ENOENT') { /* ENOENT is ok, just means the file doesn't exist yet.  Keep going */}
      else { return done(e); }
    }//ﬁ

    if (lastRunBootstrapInfo && lastRunBootstrapInfo.lastRunVersion === BOOTSTRAP_VERSION_IN_CODE_BASE) {
      sails.log('Skipping v'+BOOTSTRAP_VERSION_IN_CODE_BASE+' bootstrap script...  (because it\'s already been run)');
      sails.log('(last run on this computer: @ '+(new Date(lastRunBootstrapInfo.lastRunAt))+')');
      return done();
    }//-•

    sails.log('Running v'+BOOTSTRAP_VERSION_IN_CODE_BASE+' bootstrap script...  ('+(lastRunBootstrapInfo ? 'before this, the last time the bootstrap ran on this computer was for v'+lastRunBootstrapInfo.lastRunVersion+' @ '+(new Date(lastRunBootstrapInfo.lastRunAt)) : 'looks like this is the first time the bootstrap has run on this computer')+')');

  }//ﬁ


  //  ██╗     ███████╗████████╗███████╗     ██████╗ ███████╗████████╗
  //  ██║     ██╔════╝╚══██╔══╝██╔════╝    ██╔════╝ ██╔════╝╚══██╔══╝
  //  ██║     █████╗     ██║   ███████╗    ██║  ███╗█████╗     ██║
  //  ██║     ██╔══╝     ██║   ╚════██║    ██║   ██║██╔══╝     ██║
  //  ███████╗███████╗   ██║   ███████║    ╚██████╔╝███████╗   ██║
  //  ╚══════╝╚══════╝   ╚═╝   ╚══════╝     ╚═════╝ ╚══════╝   ╚═╝
  //
  //  ██████╗  ██████╗ ██╗    ██╗██████╗ ██╗   ██╗
  //  ██╔══██╗██╔═══██╗██║    ██║██╔══██╗╚██╗ ██╔╝
  //  ██████╔╝██║   ██║██║ █╗ ██║██║  ██║ ╚████╔╝
  //  ██╔══██╗██║   ██║██║███╗██║██║  ██║  ╚██╔╝
  //  ██║  ██║╚██████╔╝╚███╔███╔╝██████╔╝   ██║
  //  ╚═╝  ╚═╝ ╚═════╝  ╚══╝╚══╝ ╚═════╝    ╚═╝
  //
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // IWMIH, then we're about to get real rowdy.

  //  ╔╦╗┬─┐┌─┐┌─┐  ┌┬┐┌─┐┬  ┬  ┌┬┐┌─┐┌┬┐┌─┐
  //   ║║├┬┘│ │├─┘   ││├┤ └┐┌┘   ││├─┤ │ ├─┤
  //  ═╩╝┴└─└─┘┴    ─┴┘└─┘ └┘   ─┴┘┴ ┴ ┴ ┴ ┴

  // Delete certain models in order to avoid constraint violations.
  // This allows us to run tests against a database with physical constraints (e.g. postgresql).
  // Also make sure the "cascade" polyfill is deactivated (although this should be unnecessary in the latest Waterline).
  var modelsToDeleteInOrder = [
    // None so far, will add models in here when we have some directed associations...
  ];
  for (let identity of modelsToDeleteInOrder) {
    await sails.models[identity].destroy({}).meta({cascade: false});
  }
  // Delete the rest of the models.  Ideally all models should be in the list above, but if a new
  // model is added and it doesn't have any hard foreign key constraints, it can be deleted in any order,
  // and for some extra protection we'll make sure the "cascade" polyfill is deactivated.
  for (let identity of _.difference(_.keys(sails.models, modelsToDeleteInOrder))) {
    await sails.models[identity].destroy({}).meta({cascade: false});
  }

  //  ╔═╗┌┬┐┌┬┐  ┌┬┐┌─┐┬  ┬  ┌┬┐┌─┐┌┬┐┌─┐
  //  ╠═╣ ││ ││   ││├┤ └┐┌┘   ││├─┤ │ ├─┤
  //  ╩ ╩─┴┘─┴┘  ─┴┘└─┘ └┘   ─┴┘┴ ┴ ┴ ┴ ┴


  let admins = await User.createEach([{
      fullName: 'Sean',
      githubLogin: 'seanwarman',
      isSuperAdmin: true,
      password: await sails.stdlib('passwords').hashPassword({password:sails.config.defaultAdminPassword})
    }, {
      fullName: 'singularity87',
      githubLogin: 'singularity87',
      isSuperAdmin: true,
      password: await sails.stdlib('passwords').hashPassword({password:sails.config.defaultAdminPassword})
    }, {
      fullName: 'checksum0',
      githubLogin: 'checksum0',
      isSuperAdmin: true,
      password: await sails.stdlib('passwords').hashPassword({password:sails.config.defaultAdminPassword})
    }, {
      fullName: 'alwaysAn0n',
      githubLogin: 'alwaysAn0n',
      isSuperAdmin: true,
      password: await sails.stdlib('passwords').hashPassword({password:sails.config.defaultAdminPassword})
    }
  ]);

  let someUser = await User.create({
    id: 20,
    emailAddress: 'bch@2fat.co',
    password: await sails.stdlib('passwords').hashPassword({password:sails.config.defaultAdminPassword}),
    isSuperAdmin: false,
    emailStatus: 'confirmed',
    lastSeenAt: 1513213768648,
    signupComplete: false,
    githubLogin: 'ConsensusBot',
    githubUserData: {
       login: 'ConsensusBot',
       id: 34073033,
       avatar_url: 'https://avatars2.githubusercontent.com/u/34073033?v=4',
       url: 'https://api.github.com/users/ConsensusBot',
       html_url: 'https://github.com/ConsensusBot',
       followers_url: 'https://api.github.com/users/ConsensusBot/followers',
       following_url: 'https://api.github.com/users/ConsensusBot/following{/other_user}',
       gists_url: 'https://api.github.com/users/ConsensusBot/gists{/gist_id}',
       starred_url: 'https://api.github.com/users/ConsensusBot/starred{/owner}{/repo}',
       subscriptions_url: 'https://api.github.com/users/ConsensusBot/subscriptions',
       organizations_url: 'https://api.github.com/users/ConsensusBot/orgs',
       repos_url: 'https://api.github.com/users/ConsensusBot/repos',
       events_url: 'https://api.github.com/users/ConsensusBot/events{/privacy}',
       received_events_url: 'https://api.github.com/users/ConsensusBot/received_events',
       type: 'User',
       site_admin: false,
       name: 'Consensus Bot',
       public_repos: 20,
       disk_usage: 200,
       two_factor_authentication: true
    }
  }).fetch();

  //  ╔═╗┬┌┐┌┬┌─┐┬ ┬  ┌┐ ┌─┐┌─┐┌┬┐┌─┐┌┬┐┬─┐┌─┐┌─┐
  //  ╠╣ │││││└─┐├─┤  ├┴┐│ ││ │ │ └─┐ │ ├┬┘├─┤├─┘
  //  ╚  ┴┘└┘┴└─┘┴ ┴  └─┘└─┘└─┘ ┴ └─┘ ┴ ┴└─┴ ┴┴

  // Save new bootstrap version
  try {
    fs.writeFileSync(bootstrapLastRunInfoPath, JSON.stringify({
      lastRunVersion: BOOTSTRAP_VERSION_IN_CODE_BASE,
      lastRunAt: Date.now(),
    }));
  } catch (err) {
    if (err.code === 'ENOENT') {
      sails.log.warn('For some reason, could not write bootstrap version .json file.  This could be a result of a problem with your configured paths, or a limitation around cwd on your hosting provider.  As a workaround, try updating app.js to explicitly use __dirname.  Current sails.config.appPath: `'+sails.config.appPath+'`.  Full error details: '+err.stack+'\n\n....Since this is just ENOENT, proceeding anyway this time!');
    }
    else {
      return done(new Error('An unexpected error occurred writing the bootstrap version .json file.  This could be a result of a problem with your configured paths, or a limitation around cwd on your hosting provider.  As a workaround, try updating app.js to explicitly use __dirname.  Current sails.config.appPath: `'+sails.config.appPath+'`.  Full error details: '+err.stack));
    }
  }//ﬁ

  return done();
};
