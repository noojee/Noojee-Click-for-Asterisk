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
 * Since content scripts run in a context of a web page and not the extension, it's important to retrieve the options from the extension.
 * (http://code.google.com/chrome/extensions/messaging.html)
 * 
 * The following code requests the option values from the extension. (see listeners in src/js/background/background.js)
 */
chrome.extension.sendRequest(
{
	action : 'options'
}, function(response)
{
	optionsAccessor.getInstance().setStorage(response.option_values);
	noojeeClick.getInstance().onPageLoad();
});
