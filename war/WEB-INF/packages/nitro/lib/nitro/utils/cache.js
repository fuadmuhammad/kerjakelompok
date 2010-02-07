var update = require("hash").Hash.update;

var crc32 = require("crc32").encode;

/**
 * http://tomayko.com/src/rack-cache/
 * http://www.xml.com/lpt/a/1642
 * http://guides.rubyonrails.org/caching_with_rails.html#conditional-get-support
 * http://fishbowl.pastiche.org/2002/10/21/http_conditional_get_for_rss_hackers/
 */
 
var CACHEABLE_RESPONSE_CODES = [
    200, // OK
    203, // Non-Authoritative Information
    300, // Multiple Choices
    301, // Moved Permanently
    302, // Found
    404, // Not Found
    410  // Gone
];


/**
 */
exports.addETag = function(response, etag, control) {
    update(response.headers, {
        "Cache-Control": control || "public; max-age: 3600; must-revalidate",
        "ETag": etag
    })
    
    return response;
}
       
/**
 */
exports.addLastModified = function(response, lm, control) {
    var etag = crc32(lm.toString());

    update(response.headers, {
        "Cache-Control": control || "public; max-age: 3600; must-revalidate",
        "Last-Modified": lm.toGMTString(),
        "ETag": etag
    })
    
    return response;
}

/**
 * Return an uncachable response.
 */
exports.noCache = function(response) {
    update(response.headers, {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Expires": new Date().toGMTString()
    });
    
    return response;
}

