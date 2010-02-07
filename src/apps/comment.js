var Request = require("jack/request").Request,
    Response = require("jack/response").Response;
    

exports.app = function(env) {
    return exports[env.REQUEST_METHOD](env);
};

exports.GET = function(env) {
    body = "ini comment";
    return {
        status: 200,
        headers: {"Content-Type": "text/html"},
        body: [body]
    };
};

exports.POST = function(env) {
    var params = new Request(env).POST(),
        msg = new Message(params);
        
    msg.put();
    
    return Response.redirect("/");
};
