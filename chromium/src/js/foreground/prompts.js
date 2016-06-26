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


var prompts = ( function( window, undefined ) 
{
	var instance = null;
	  
	// revealing module pattern that handles initialization of our new module
	function initializeNewModule() 
	{
		function alert(msg)
		{
			alert(msg);
		}
		
		function prompt(msg, defaultValue)
		{
			var input = {value: defaultValue};
			var check = {value: false};
			var result = prompt(window, "Noojee Click: ", msg, input, null, check);
			// input.value is the string user entered
			// result - whether user clicked OK (true) or Cancel
		
			return {value: input.value, OK:result};
		}
		
		return 
		{
			alert : alert,
			prompt : prompt
		};
		
	} // end initializeNewModule
	
	
	// handles the prevention of additional instantiations
	function getInstance() 
	{
		if( ! instance ) 
		{
			instance = new initializeNewModule();
		}
		return instance;
		}
	
	return 
	{
		getInstance : getInstance
	};

} )( window );
