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
 * NOTE: namespace.js MUST be the first njclick <script> tag included
 * in any html file. This is because its onload (jquery ready) method
 * MUST be called first. 
 * Of course the jquery scripts MUST be included before namespace.js.
 * 
 * Don't you hate javasript!
 */

var noojeeClick = {};

noojeeClick.LIB = {
    // Extension app singleton shortcut
    theApp: noojeeClick
};



(function()
{
	// Registration
	var namespaces = [];
 
	// As each module (.js) file loads
	// it registers itself as a name space by calling noojeeClick.ns(...).
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
				try
				{
				var fn = namespaces[i];
				var ns = namespaces[i + 1];

				if (fn == undefined)
					console.log("fn is undefined");
				else if (ns == undefined)
					console.log("ns is undefined");
				else
					{
					try
				{
						if (fn.apply == undefined)
							console.log("ns is undefined");
						else
					fn.apply(ns);
				}
				catch (e)
				{
					alert("Noojee Click error in namespace.init in apply " + e);
				}
					}
				}
				catch (e)
				{
					alert("Noojee Click error in namespace.init in for " + e);
				}
			}
		}
		catch (e)
		{
			alert("Noojee Click error in namespace.init " + e);
		}
	};
	
	// Register handlers to maintain extension life cycle.
	// We use jquery ready to ensure that when multiple 'ready'
	// handlers are added that they are executed in order.
	// This ready handler MUST always be called first so you need
	// to ensure that namespace.js is the first <script> tag
	// in your html file (after the jquery scripts).
	$(document).ready(function () {noojeeClick.loadNamespace();});
	//window.addEventListener("load", noojeeClick.loadNamespace, false);
	window.addEventListener("unload", noojeeClick.shutdown, false);

}).apply(noojeeClick);