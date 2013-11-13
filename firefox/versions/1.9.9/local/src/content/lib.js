/**
 * @author: Jan Odvarko
 * @url: http://www.softwareishard.com
 */


// Shared library of methods/data for entire extension.
noojeeClick.LIB = {

    // APIs
    getCurrentURI: function() {
        return window.location.href;
    },

    // Extension app singleton shortcut
    theApp: noojeeClick,

    // XPCOM
    Cc: Components.classes,
    Ci: Components.interfaces,
};
