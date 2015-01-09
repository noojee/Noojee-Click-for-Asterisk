/**
 * Copyright 2012 Sven Werlen
 *
 * This file is part of Noojee Click.
 * 
 * Noojee Click is free software: you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the 
 * Free Software Foundation, either version 3 of the License, or (at your 
 * option) any later version.
 * 
 * Noojee Click is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License 
 * for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with Noojee Click. If not, see http://www.gnu.org/licenses/.
 **/

noojeeClick.loadNamespace();

/**
 * Create context menus for selection
 */
chrome.contextMenus.removeAll();
chrome.contextMenus.create({
    "title": "Dial %s",
    "type": "normal",
    "contexts": ["browser_action"],
    "onclick": dial()
});

function dial() {
    return function (info, tab) {
	noojeeClick.LIB.theApp.asterisk.getInstance().dial(info.selectionText);
    };
};


/*
 * Handles Request from the content page.
 * Requests are sent here via messagepassing.js
 * 
 */
chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		// content script requests for option values
		if (request.type == "options") {
			// send response
			sendResponse({option_values: localStorage});
		}
		// dial number
		else if (request.type == "dial") {
			noojeeClick.LIB.theApp.asterisk.getInstance().dial(request.phoneNo);
			// empty response
			sendResponse({});
		}
		else if (request.type == "hangup") {
			noojeeClick.LIB.theApp.asterisk.getInstance().hangup();
			// empty response
			sendResponse({});
		}
		
		
		

		// ignore invalid requests
		else {
			sendResponse({});
		}
	}
);

/**
 * Handle installs
 * 
 */
chrome.runtime.onInstalled.addListener(function(details)
{
    if(details.reason == "install")
    {
        noojeeClick.LIB.theApp.prefs.initPrefs();
        console.log("This is a first install!");
    }
    else if(details.reason == "update")
    {
        var thisVersion = chrome.runtime.getManifest().version;
        noojeeClick.LIB.theApp.prefs.initPrefs();
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});



