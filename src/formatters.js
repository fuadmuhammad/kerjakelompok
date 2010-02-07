// Define custom formatters for the templates.

var Template = require("template").Template;

Template.formatters.bctitle = function(str) {
    var title = "Simple Blog";
    if (str) {
        var match = str.match(/\<b\>(.*?)\<\/b\>/);
        if (match) title = match[1] + " : " + title;
    }
    return title;
}

Template.formatters.date = function(date) {
    return date.format("dd/mm/yyyy");
}

Template.formatters.time = function(date) {
    return date.format("dd/mm/yyyy HH:MM:ss")
}


