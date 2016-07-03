/**
 * Copyright 2012 Brett Sutton (Adapted for Google Chrome by Sven Werlen)
 * 
 * This file is part of Noojee Click.
 * 
 * Noojee Click is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * Noojee Click is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with Noojee Click. If not, see http://www.gnu.org/licenses/.
 */

// constants
var CONST_IMG_CALLPHONE = chrome.extension.getURL("img/call-phone.png");


//
// Provides an interface that gives access to the options stored in localstorage
// in the background process.
//
var optionAccessor = ( function( window, undefined ) 
{
	var instance = null;

	// As this is a content script the storage is loaded
	// from background and set after page load
	var storage = null;

	// revealing module pattern that handles initialization of our new module
	function initializeNewModule() 
	{
		/**
		 * localStorage is only available to the background page. As such on startup the foreground page needs to pull in the background stored options
		 */
		function init()
		{
			if (storeage === null)
			{
				chrome.extension.sendRequest({ action: 'options' }, function (response) {
					setStorage(response.option_values);
				});
			}
		}
		
		
		function getValue(key)
		{
			return this.storage[key];
		}

		function setValue(key, value)
		{
			storage[key] = value;
		}

		function getBoolValue(key)
		{
			return this.getValue(key) == "true";
		}

		function setBoolValue(key, value)
		{
			storage[key] = (value == "true" ? true : false);
		}
		
		function getUsername()
		{
			return getValue("username");
		}
		
		function getPassword(username)
		{
			return getValue("password");	
		}

		return {
			init : init,
			setValue : setValue,
			getBoolValue : getBoolValue,
			setBoolValue : setBoolValue,
			getUsername : getUsername,
			getPassword : getPassword
		};
	  
	} // end initializeNewModule
	  

	// handles the prevention of additional instantiations
	function getInstance() 
	{
		if( ! instance ) 
		{
			instance = new initializeNewModule();
			instance.init();
		}
		return instance;
	}
  
	return 
	{
		getInstance : getInstance
	};
  
} )( window );
