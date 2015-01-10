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


noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.prefs =
{
	// constants
	CONST_IMG_CALLPHONE:  chrome.extension.getURL("img/call-phone.png"),
	
	// for content scripts, the storage is loaded
	// from background and set after page load
	storage: null,
	
	setStorage: function (storage)
	{
		this.storage = storage;
	},
		
	getValue: function (key)
	{
		return (this.storage != null ? this.storage[key] : localStorage[key]);
	},

	getBoolValue: function (key)
	{
		return this.getValue(key) == "true";
	},

	setValue: function (key, value)
	{
		localStorage[key] = value;
	},

	setBoolValue: function (key, value)
	{
		localStorage[key] = (value == "true" ? true : false);
	},
	
	getUsername: function()
	{
		return theApp.prefs.getValue("username");
	},
	
	getPassword: function(username)
	{
		return theApp.prefs.getValue("password");	
	},
	
	/** 
	 * Used on a first time install (and perhaps on an update)
	 * to set defaults for local storage.
	 * The default values are created by 'prefs.js' under the
	 * key prefix extensions.noojeeclick.
	 * 
	 * This method takes those defaults and puts them into the correct local storage.
	 * 
	 * We do this two phase method to be compatible with firefoxes 'pref' method for setting up defaults.
	 * The problem with the firefox method under chrome is that we have no way of controling when the 
	 * defaults/preferencespreferences.js script runs so it runs every time the extension starts (by inclusion in background.html)
	 * rather than just on install or update.
	 * So initPrefs is only called on install or update to copy any defaults into localstorage. This stops
	 * localstorage being overwritten all of the time.
	 */
	initPrefs: function()
	{
		for (var i=0; i < localStorage.length; i++) 
		{
			var key = localStorage.key(i);
			var value = localStorage[key];

			var prefix = "z.defaults.noojeeclick.";
			var len = prefix.length;
			// Is this a default
			if (key.indexOf(prefix) == 0)
			{
				// yes so transfer it.
				key = key.substring(len);
				localStorage[key] = value;
				console.log(key + " : " + value);
			}
		}
	},
	
	onConfiguration: function (e)
	{
		chrome.tabs.create({url: "options.html"});
		return true;
	},


};

}});