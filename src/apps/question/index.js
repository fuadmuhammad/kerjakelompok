var Request = require("jack/request").Request,
    Response = require("jack/response").Response;

var paginate = require("paging").paginateByKey;

var Question = require("models/question").Question;

exports.GET = function(env) {
	var params = new Request(env).params();
   	var page = paginate(Question.all().order("-created"), params.pb, 10);    	
	return {data: {
        questions: page.items.map(function(q) {
        	return {
        		key: q.key(),
        		author: q.author,
        		question: q.question,
        		created: q.created
        	};
        }),
        page: page.controls("?pb=")
    }};

};