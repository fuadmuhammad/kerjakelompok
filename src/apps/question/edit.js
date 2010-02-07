var Request = require("jack/request").Request,
    Response = require("jack/response").Response,
    redirect = require("jack/response").Response.redirect;

var Question = require("models/question").Question;
    
var ModelForm = require("google/appengine/ext/db/forms").ModelForm,
    QuestionForm = ModelForm(Question);

exports.GET = function(env) {
	var params = new Request(env).params();
	print(params.id);
	
	if(params.id){
		question = Question.get(params.id);
		if(!question)
			return Response.notFound("Article not found");
		
		var response =  {data: {
	        author: question.author,
	        question: question.question
	    }};
		
		return response;
	}else
	    return redirect("/question/index");
};

exports.POST = function(env){
    var params = new Request(env).params();
    
    var question = new Question();
    
    var form = new QuestionForm(params, {instance: question});
    question.created = new Date();
    form.put();

    return redirect("/question/index");
};