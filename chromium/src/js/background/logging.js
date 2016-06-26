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


// Singleton Logger.
var logging = ( function( window, undefined ) 
{
	var instance = null;
	  
	// revealing module pattern that handles initialization of our new module
	function initializeNewModule() 
	{
		function njlog(msg)
		{
			if (options.getInstance().getBoolValue("enableLogging") === true)
			{
				console.log("NJClick: " + arguments.callee.caller.name + " info: " + msg);
			}
		}
		
		function njdebug(module, msg)
		{
		
			if (options.getInstance().getBoolValue("enableDebugging") === true)
			{
				var filter = options.getInstance().getValue("debugFilter");
				
				if (filter === null || filter.search(module, "i") >= 0)
				{
					console.log("NJClick: " + arguments.callee.caller.name + " debug (" + module + "): " + msg);
				}
			}
		}
		
		function njerror(msg)
		{
			console.log("NJClick: " + arguments.callee.caller.name + " error: " + msg);
		}
		
		return 
		{
			njlog : njlog,
			njdebug : njdebug,
			njerror : njerror,
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
