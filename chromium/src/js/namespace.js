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

var noojeeClick = {};

(function()
{
	// Registration
	var namespaces = [];
 
	// As each module (.js) file loads
	// it registers itself as a namespace by calling noojeeClick.ns(...).
	this.ns = function(fn)
	{
		var aNamespace = {};
		namespaces.push(fn, aNamespace);
 
		return aNamespace;
	};
	
	// Initialization
	this.loadNamespace = function()
	{
		try
		{
			for ( var i = 0; i < namespaces.length; i += 2)
			{
				var fn = namespaces[i];

				var ns = namespaces[i + 1];
				fn.apply(ns);
			}
		}
		catch (e)
		{
			alert("Noojee Click error in init" + e);
		}
	};
	
	// Register handlers to maintain extension life cycle.
	window.addEventListener("load", noojeeClick.loadNamespace, false);
	window.addEventListener("unload", noojeeClick.shutdown, false);

}).apply(noojeeClick);