/**
 * A simple and portable templating system. Can be used at server or client side.
 * Allows for recursive templates using escaped interpolators.
 *
 * Based on ideas from jsontemplate.org
 *
 * str = the template source as a string
 * options = {
 *     formatters: {
 *          "fmt1": function(val) {
 *          },
 *          ...
 *     }
 * }
 */ 
var Template = exports.Template = function(str, options) {
    var formatters;
    
    if (options && options.formatters) {
        formatters = {};
        for (var i in Template.formatters) formatters[i] = Template.formatters[i];
        for (var i in options.formatters) formatters[i] = options.formatters[i];
    } else {
        formatters = Template.formatters;
    }
    
    this.program = compile(str, formatters);
}

/**
 * Render the template to a string.
 */
Template.prototype.render = function(data) {
    return execute(this.program, new Scope(data));
}

/**
 * Formatting functions used in interpolations.
 * This map can be extended with application-specific formatters.
 */
Template.formatters = {
    html: function(str) {
        return str.replace(/&/g, "&amp;").replace(/>/g, "&gt;").
                   replace(/</g, "&lt;");
    },
    attr: function(str) {
        return str.replace(/&/g, "&amp;").replace(/>/g, "&gt;").
                   replace(/</g, "&lt;").replace(/"/g, "&quot;");
    },
    uri: encodeURI,
    fixed: function(num) {
    	return Number(num).toFixed();    	
    }
}

var TOKEN_RE = new RegExp("(\{.+?\}\n?)"),
	COMMAND_RE = /^\{[\.a-zA-Z]/,
    INTERP_RE = /^\{[\w\|\.]+?\}$/,
	WITH_RE = /(section|repeated section|with|if)\s+(\S+)?/;

// A program block.
var Block = function() {
    this.statements = [];
}

// Add a new statement to the program block.
Block.prototype.push = function(stmt) {
    this.statements.push(stmt);
}

// A program scope implemented as a stack of contexts.
var Scope = function(data) {
    this.stack = [data];
}

// Create a new context (frame) in the scope stack. Typically a value in the
// current context is unshifted as a new context.
// Also handles 'dotted' names by traversing the context hierarchy.
Scope.prototype.push = function(names) {
    var context;
    
    var name = names[0];
    
    if (name == "@") { // if the name == "@" use the current cursor value.
        context = this.stack[0];
    } else {
        context = this.stack[0][name];
        for (var i = 1; i < names.length; i++) {
            if (!context) break;
            context = context[names[i]];
        }
    }
        
    if (context) {
        this.stack.unshift(context);
    }

    return context;
}

Scope.prototype.pop = function() {
    this.stack.shift();
}

Scope.prototype.replace = function(context) {
    this.stack[0] = context;
}

// Lookup the value for the given name in the scope stack.
Scope.prototype.lookup = function(names) {
    var name = names.pop();
    if (names.length > 0) this.push(names);
        
    var value;

    for (var i = 0; i < this.stack.length; i++) {
        value = this.stack[i][name];
        if (value != undefined) break;
    }

    if (names.length > 0) this.pop();
    names.push(name); // to be reused for loops
    
    return value;
}

// [op_write, string]
var op_write = function(stmt) {
    return stmt[1];
}

// [op_interpolate, variableName, [formatters]]
var op_interpolate = function(stmt, scope) {
    var value = scope.lookup(stmt[1]);
    if (value != undefined) {
        var formatters = stmt[2];
        for (var i = 0; i < formatters.length; i++)
            value = formatters[i](value);
    } 

    return value;    
}

// [op_section, variableName, block]
var op_section = function(stmt, scope) {
    var output = "";
    var context = scope.push(stmt[1]);

    // if there is no context, execute the "or" clause.
    var block = context ? stmt[2] : stmt[2]["or"];

    if (block) {
        output = execute(block, scope);
    }
            
    if (context) scope.pop();
    return output;
}

// [op_repeated_section, variableName, block]
var op_repeated_section = function(stmt, scope) {
    var output = "";
    var context = scope.push(stmt[1]);

    // if there is no context, execute the "or" clause.
    var block = context ? stmt[2] : stmt[2]["or"];

    if (block) {
        // The context is an array, loop.
        for (var i = 0; i < context.length; i++) {
            scope.replace(context[i]);
            output += execute(block, scope);
        }
    }
            
    if (context) scope.pop();
    return output;
}

// Execute a template program.
var execute = function(program, scope) {
    var output = [];
    var statements = program.statements;
    
    for (var i = 0; i < statements.length; i++) {
        var stmt = statements[i];
        output.push(stmt[0](stmt, scope));
    }
    
    return output.join("");
}

// Compile the input string into a program (list of statements).
var compile = function(str, allFormatters) {
    var program = new Block();
    var stack = [];

    // Split the input string in tokens. 
    var tokens = str.split(TOKEN_RE);
    
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        // FIXME: hack fix to handle {_, for example client side javascript
        // blocks. Come up with a better TOKEN_RE.
        if (token.match(COMMAND_RE)) {
        	if (token.slice(-1) == "\n")
                token = token.slice(null, -1);

            if (token[1] == "#") // comment
                continue;
            
            if (token[1] == ".") { // statement
                token = token.substring(2, token.length-1);
                
                var match = token.match(WITH_RE);
                if (match) { // with block
                    stack.push(program);
                    var block = new Block();
                    program.push([
                        match[1] == "repeated section" ? op_repeated_section : op_section, 
                        match[2].split("."), 
                        block
                    ]);
                    program = block;
                    continue;
                }

                if (token == "or") { // or clause of a section block
                    program = program["or"] = new Block();
                    continue;
                }
                
                if (token == "end") { // end of a with block
                    program = stack.pop();
                    if (!program) throw "Too many {.end} statements";
                    continue;
                }

                if (token == "space") {
                    program.push([op_write, " "]);
                    continue;
                }
                
                if (token == "newline") {
                    program.push([op_write, "\n"]);
                    continue;
                }
                
                if (token == "tab") {
                    program.push([op_write, "\t"]);
                    continue;
                }
                                
                if (token == "meta-left") { // meta-left
                    program.push([op_write, "{"]);
                    continue;
                }

                if (token == "meta-right") { // meta-right
                    program.push([op_write, "}"]);
                    continue;
                }
            } 
 
            if (token.match(INTERP_RE)) { // variable interpolation with optional formatters.
                var parts = token.substring(1, token.length-1).split("|");
                var name = parts.shift();
                var formatters = [];
                for (var j = 0; j < parts.length; j++) {
                    var formatter = allFormatters[parts[j]];
                    if (formatter) {
                        formatters.push(formatter);
                    } else {
                        throw "Undefined formatter '" + parts[j] + "'";
                    }
                }

                program.push([op_interpolate, name.split("."), formatters]);
            } else { // plain text
                program.push([op_write, token]);
            }
        } else { // plain text
            program.push([op_write, token]);
        }
    }

    return program;
}
