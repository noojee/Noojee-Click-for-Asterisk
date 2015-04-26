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
	
	


};

}});