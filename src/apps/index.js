var Request = require("jack/request").Request,
    Response = require("jack/response").Response;

var Question = require("models/question").Question;

exports.app = function(env) {
    return exports[env.REQUEST_METHOD](env);
}

exports.GET = function(env) {
    var questions = Question.all().fetch();
    for(var i=0; i<questions.length; i++){
	print(questions[i].author);
    }
    var params = new Request(env).params();
    return {data: {
	test: "welcome"
    }};

}

exports.POST = function(env) {
    var params = new Request(env).POST(),
        msg = new Message(params);
        
    msg.put();
    
    return Response.redirect("/");
}
