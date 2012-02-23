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

/**
 * Create context menus for selection
 */
chrome.contextMenus.create({
    "title": "Dial %s",
    "type": "normal",
    "contexts": ["selection"],
    "onclick": dial()
});

chrome.contextMenus.create({
    "title": "Dial 0%s",
    "type": "normal",
    "contexts": ["selection"],
    "onclick": editAndDial()
});


function dial() {
    return function (info, tab) {
	noojeeClick.LIB.theApp.asterisk.getInstance().dial(info.selectionText);
    };
};

function editAndDial() {
    return function (info, tab) {

        // The srcUrl property is only available for image elements.
        var url = 'http://127.0.0.1:7069/Dial/0' + info.selectionText;
        // Create a new window to the info page.
        chrome.windows.create({ url: url, width: 520, height: 660 });
    };
};

/*******************************************
 * Interactions with page                  *
 *******************************************/
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
		// ignore invalid requests
		else {
			sendResponse({});
		}
	}
);

noojeeClick.initialize();
