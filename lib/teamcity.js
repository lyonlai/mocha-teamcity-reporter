/**
 * Module dependencies.
 */

var Base, log;

if (typeof window === 'undefined') {
  // running in Node
  Base = require('mocha').reporters.Base;
  log = console.log;
  /**
   * Expose `Teamcity`.
   */

  exports = module.exports = Teamcity;
} else {
  // running in mocha-phantomjs
  try {
    Base = require('./base');
    log = function(msg) { process.stdout.write(msg + "\n"); };
    exports = module.exports = Teamcity;
  } catch(e) {
    //mocha browser environment.
    Base = Mocha.reporters.Base;
    log = function() { console.log.apply(console, arguments);  };
    Mocha.reporters.Teamcity = Teamcity;
  }

}



/**
 * Initialize a new `Teamcity` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Teamcity(runner) {
  Base.call(this, runner);
  var stats = this.stats;

  runner.on('suite', function(suite) {
    if(suite.root) return;
    suite.startDate = new Date();
    log("##teamcity[testSuiteStarted name='" + escape(suite.title) + "']");
  });

  runner.on('test', function(test) {
    log("##teamcity[testStarted name='" + escape(test.title) + "' captureStandardOutput='true']");
  });

  runner.on('fail', function(test, err) {
    log("##teamcity[testFailed name='" + escape(test.title) + "' message='" + escape(err.message) + "' details='" + escape(err.stack) + "' captureStandardOutput='true']");
  });

  runner.on('pending', function(test) {
    log("##teamcity[testIgnored name='" + escape(test.title) + "' message='pending']");
  });

  runner.on('test end', function(test) {
    log("##teamcity[testFinished name='" + escape(test.title) + "' duration='" + test.duration + "']");
  });

  runner.on('suite end', function(suite) {
    if (suite.root) return;
    log("##teamcity[testSuiteFinished name='" + escape(suite.title) + "' duration='" + (new Date() - suite.startDate) + "']");
  });
}

/**
 * Escape the given `str`.
 */

function escape(str) {
  if (!str) return '';
  return str
    .toString()
    .replace(/\|/g, "||")
    .replace(/\n/g, "|n")
    .replace(/\r/g, "|r")
    .replace(/\[/g, "|[")
    .replace(/\]/g, "|]")
    .replace(/\u0085/g, "|x")
    .replace(/\u2028/g, "|l")
    .replace(/\u2029/g, "|p")
    .replace(/'/g, "|'");
}
