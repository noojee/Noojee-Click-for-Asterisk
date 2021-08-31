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



var commonUtil = ( function( window, undefined ) 
{
	
	function Right(str, n)
	{
		if (n <= 0)
			return "";
		else if (n > String(str).length)
			return str;
		else
		{
			var iLen = String(str).length;
			return String(str).substring(iLen, iLen - n);
		}
	}
	
	function Left(str, n)
	{
		if (n <= 0)
			return "";
		else if (n > String(str).length)
			return str;
		else
		{
			return String(str).substring(0, n);
		}
	}
	
	function trim(string)
	{
		return string.replace(/^\s+|\s+$/g, "");
	}
	
	function ltrim(string)
	{
		return string.replace(/^\s+/, "");
	}
	
	
	function rtrim()
	{
		return string.replace(/\s+$/, "");
	}
	/**
	 * Unfortunately due to security concerns Mozilla deprecated the ability to dumpe a stacktrace.
	 */
	function stacktrace(e)
	{
		return "";
	// var e = new Error('dummy');
	// var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '') // remove lines without '('
	// .replace(/^\s+at\s+/gm, '') // remove prefix text ' at '
	// .split('\n');
		
	// var f = this.stacktrace;
	// var stack = "Stack trace:";
	// while (f)
	// {
	// if (f != this.stacktrace)
	// stack += "\n" + f.name;
	// f = f.caller;
	// }
	// return stack;
	
	}
	
	function showTree(node)
	{
		logging.getInstance().njdebug("util", "showTree");
		while (node !== null)
		{
			logging.getInstance().njdebug("util", node + ":" + node.nodeName + ":" + node.nodeValue + (node.text !== undefined ? (":" + node.text) : ""));
			node = node.parentNode;
		}
	}
	
	
	/*
	 * Returns the class name of the argument or undefined if it's not a valid JavaScript object.
	 */
	function getObjectClass(obj)
	{
		if (obj && obj.constructor && obj.constructor.toString)
		{
			var arr = obj.constructor.toString().match(/function\s*(\w+)/);
	
			if (arr && arr.length == 2)
			{
				return arr[1];
			}
		}
	
		return undefined;
	}
	 return {
		 Right : Right,   
		 Left : Left,
		 trim : trim,
		 ltrim : ltrim,
		 rtrim : rtrim,
		 stacktrace : stacktrace,
		 showTree : showTree,
		 getObjectClass : getObjectClass
		  };

} )( window );

