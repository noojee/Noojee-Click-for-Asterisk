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


function dial() {
    return function (info, tab) {
	this.dial(info.selectionText);
    };
};

function dial(phoneNo) 
{
	if (noojeeClick.LIB.theApp.asterisk.isConfigured())
		noojeeClick.LIB.theApp.asterisk.getInstance().dial(phoneNo);
	else
		noojeeClick.LIB.theApp.prompts.njAlert("Please configure Asterisk options first.");
}


/*
 * Handles Request from the content page.
 * Requests are sent here via backgroundMessageTo.js
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
			this.dial(request.phoneNo);

			// empty response
			sendResponse({});
		}
		else if (request.type == "hangup") {
			noojeeClick.LIB.theApp.asterisk.getInstance().hangup();
			// empty response
			sendResponse({});
		}
		else if (request.type == "callFailed") {
			noojeeClick.LIB.theApp.dialStatus.callFailed();
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
        noojeeClick.LIB.theApp.options.initOptions();
        console.log("This is a first install!");
    }
    else if(details.reason == "update")
    {
        var thisVersion = chrome.runtime.getManifest().version;
        noojeeClick.LIB.theApp.options.initOptions();
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});



