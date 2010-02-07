var Request = require("jack/request").Request,
    redirect = require("jack/response").Response.redirect;

var Question = require("models/question").Question;
    
var ModelForm = require("google/appengine/ext/db/forms").ModelForm,
    QuestionForm = ModelForm(Question);

exports.GET = function(env){
	
};

exports.POST = function(env) {
    var params = new Request(env).params();
    
    var question = new Question();
    
    var form = new QuestionForm(params, {instance: question});
    question.created = new Date();
    form.put();

    return redirect("/");
};

