/**
 * API helper middleware.
 */
exports.API = function(app, base) {
    
    var BASE_RE = new RegExp("^" + (base || "/api"));
    
    return function (env) {
        var path = env["PATH_INFO"];
        
        if (BASE_RE.test(path)) {
            path = path.replace(BASE_RE, "/").replace(/\/\//, "/");
            env["HTML_X_API"] = true;
            env["PATH_INFO"] = path;
        }        
        
        if (env["HTML_X_API"]) env.api = true;
               
        return app(env);
    }
    
}
