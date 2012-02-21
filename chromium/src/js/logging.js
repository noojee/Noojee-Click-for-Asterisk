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
		var now = new Date();
		var hour = now.getHours();
		var min = now.getMinutes();
		var sec = now.getSeconds();
		var mil = now.getMilliseconds();
		console.log(arguments.callee.caller.name + " " + hour + ":" + min + ":" + sec + ":" + mil + " info: " + msg);
	}
},

njdebug: function (module, msg)
{

	if (theApp.prefs.getBoolValue("enableDebugging") == true)
	{
		var filter = theApp.prefs.getValue("debugFilter");

		if (filter.search(module, "i") >= 0)
		{
			var now = new Date();
			var hour = now.getHours();
			var min = now.getMinutes();
			var sec = now.getSeconds();
			var mil = now.getMilliseconds();
			console.log(arguments.callee.caller.name + " " + hour + ":" + min + ":" + sec + ":" + mil+ " debug (" + module + "): " + msg);
		}
	}
},

njerror: function (msg)
{
		var now = new Date();
		var hour = now.getHours();
		var min = now.getMinutes();
		var sec = now.getSeconds();
		var mil = now.getMilliseconds();
		console.error(arguments.callee.caller.name + " " + hour + ":" + min + ":" + sec + ":" + mil + " error: " + msg);
},

};

}});


