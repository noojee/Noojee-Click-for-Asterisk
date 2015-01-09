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
 * Each content page gets its own copy of the options for fast access.
 * 
 * Since content scripts run in a context of a web page and not the 
 * extension, it's important to retrieve the options from the extension.
 * (http://code.google.com/chrome/extensions/messaging.html)
 * 
 * The following code requests the option values from the extension.
 * (see listeners in background.js)
 * 
 */
var options;

chrome.extension.sendRequest({type: "options"}, function(response) 
{
	   // retrieve all options from background process
		options = response.option_values;
		
		with (noojeeClick.LIB) 
		{
			// initialise nj click for this content page.
			noojeeClick.loadNamespace();

			// store the options
			theApp.prefs.setStorage(options);

			
			var e = { originalTarget : document};
			theApp.noojeeclick.onPageLoad(e);
		}
});


/**
 * Handles messages sent from non-content scripts.
 * Messages are passed via contentsriptMessageTo.js
 */
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) 
{
	 if (request.action == "showClickIcons")
	 {
		 noojeeClick.handlersContent.onShowClickIcons();
	 }
	 else if (request.action == "refresh")
	 {
		 noojeeClick.LIB.theApp.render.onRefreshOne(document);
	 }
	 else
	   sendResponse({}); // Send nothing..
});








