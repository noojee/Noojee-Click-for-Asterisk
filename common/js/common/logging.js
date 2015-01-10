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

theApp.logging =
{

njlog: function (msg)
{
	if (theApp.prefs.getBoolValue("enableLogging") == true)
	{
		console.log("NJClick: " + arguments.callee.caller.name + " info: " + msg);
	}
},

njdebug: function (module, msg)
{

	if (theApp.prefs.getBoolValue("enableDebugging") == true)
	{
		var filter = theApp.prefs.getValue("debugFilter");
		
		if (filter == null || filter.search(module, "i") >= 0)
		{
			console.log("NJClick: " + arguments.callee.caller.name + " debug (" + module + "): " + msg);
		}
	}
},

njerror: function (msg)
{
	console.log("NJClick: " + arguments.callee.caller.name + " error: " + msg);
},

};

}});


