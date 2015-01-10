/**
 * Copyright 2012 Brett Sutton
 * (Adapted for Google Chrome by Sven Werlen)
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
 * This class is used to pass messages from content scripts to the background process.
 * This is specific to Chrome extension's development. 
 * 
 * The background process is implemented in background.js 
 **/
noojeeClick.ns(function() { with (noojeeClick.LIB) {

/**
 * 
 */
theApp.contentScriptMessageTo =
{

showClickIcons: function ()
{
	chrome.tabs.getSelected(null, function(tab) 
			{
				// Send a request to the content script in the current tab to re-render the click icons.
				chrome.tabs.sendRequest(tab.id, {action: "showClickIcons"}, function(response) 
				{
					console.log(response);
				});
			});
},

refresh: function ()
{
	chrome.tabs.getSelected(null, function(tab) 
			{
				
				// Send a request to the content script in the current tab to re-render the click icons.
				chrome.tabs.sendRequest(tab.id, {action: "refresh"}, function(response) 
				{
					console.log(response);
				});
			});

},

};

}});


