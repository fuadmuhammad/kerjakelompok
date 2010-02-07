require.paths.unshift("WEB-INF/src");

var ContentLength = require("jack/contentlength").ContentLength,
    MethodOverride = require("jack/methodoverride").MethodOverride,
    ShowExceptions = require("jack/showexceptions").ShowExceptions,
    CookieSessions = require("jack/session/cookie").Cookie,
    Lint = require("jack/lint").Lint; 
        
var Dispatch = require("nitro/dispatch").Dispatch,
    Path = require("nitro/path").Path,
    Errors = require("nitro/errors").Errors,
    Render = require("nitro/render").Render;		

var Wrap = require("./src/wrap").Wrap;

var appsRoot = "WEB-INF/src/apps",
    templatesRoot = "WEB-INF/src/templates";

exports.app = ContentLength(MethodOverride(CookieSessions(Path(Errors(Render(Wrap(Dispatch(appsRoot)), templatesRoot))), {secret:  "sessionsecret"})));

// Debug version of the application.
exports.debug = ShowExceptions(exports.app);

// Run on development server.
exports.local = function(app) {
    return require("jack/reloader").Reloader(module.id, "debug");
}

// Run on Google App Engine hosting infrastructure.
exports.hosted = function(app) {
	return app;
}

