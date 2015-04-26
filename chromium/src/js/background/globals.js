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
 * This method is used to provide cross browser compatibility with the firefox preference system.
 * 
 * In firefox the 'pref' method is used to store default values into the firefox 'preference' system
 * on install.
 * 
 * So we can use the same definitions in chrome this method is declared which pushes the preferences
 * into local storage.
 * 
 * (required by js/noojee/defaults/preferences/preferences.js)
 **/

function pref(key, value) 
{
	// check that value is not already set
	if( !localStorage[key] ) 
	{
		// Strip 'extensions.' and add a 'z.defaults' 
		// prefix so all of the defaults
		// are grouped at the bottom of the localstorage
		// as that makes it easier to read the contents
		// of the localstorage settings.
		localStorage["z.defaults."+key.substring(11)] = value;
	}
}

