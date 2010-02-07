var db = require("google/appengine/ext/db");

var Question = exports.Question = db.Model("Question", {
    author: new db.StringProperty({required: true, multiline: false}),
    question: new db.TextProperty(),
    created: new db.DateTimeProperty({autoNowAdd: true})
});
