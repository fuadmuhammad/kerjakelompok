var Key = require("google/appengine/api/datastore/types").Key;

var Page = function() {
}

Page.prototype.controls = function(prefix) {
    return {
        next: this.next ? (prefix + this.next) : undefined,
        prev: this.prev
    }
}

/**
 * Datastore paging.
 * http://code.google.com/appengine/articles/paging.html
 */
exports.paginateByKey = function(query, bookmark, limit) {
    limit = limit || 10;
    query = query.order("-__key__");

    var page = new Page();

    if (bookmark) {
        query = query.filter("__key__ <=", new Key(bookmark));
        page.prev = "javascript:window.history.back()";
    }

    page.items = query.limit(limit + 1).fetch();

    if (page.items.length == (limit + 1)) {
        page.next = page.items[page.items.length - 1].key();
        page.items.pop();
    }
    
    return page;
}
