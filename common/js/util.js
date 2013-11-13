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

theApp.util =
{

Right: function(str, n)
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
},

Left: function(str, n)
{
	if (n <= 0)
		return "";
	else if (n > String(str).length)
		return str;
	else
	{
		return String(str).substring(0, n);
	}
},

trim: function(string)
{
	return string.replace(/^\s+|\s+$/g, "");
},

ltrim: function(string)
{
	return string.replace(/^\s+/, "");
},


rtrim: function()
{
	return string.replace(/\s+$/, "");
},

isRClick: function(e)
{
	var emod = (e) ? (e.eventPhase) ? "W3C" : "NN4" : (window.event) ? "IE4+" : "unknown";

	return (emod == "NN4") ? (e.which > 1) : (e.button == 2);
},


addGlobalStyle: function (document, css)
{
	var success = false;
	var style = document.createElement("style");
	style.setAttribute("noojeeclick", "true");
	style.id = "noojeeClickStyle";
	style.type = "text/css";
	style.textContent = css;
	var head = document.getElementsByTagName('head')[0];
	if (head != null)
	{
		head.appendChild(style);
		success = true;
	}

	return success;
},

hasGlobalStyle: function (document)
{
	var hasStyle = false;

	var noojeeStyle = document.getElementById("noojeeClickStyle");
	if (noojeeStyle != null)
		hasStyle = true;
	theApp.logging.njdebug("util", "hasStyle=" + hasStyle);
	return hasStyle;
},

showError: function (response, message)
{
	theApp.logging.njerror("showError r=" + response + " m=" + message);
	theApp.prompts.njAlert(message);
	//theApp.dialstatus.getInstance().updateStatus(message);
},

showException: function (method, e)
{
	var message = 
		"An exeption occured in method '" + method + "' " + e.name + ".\n" +
		"filename: " + e.filename + ".\n" +
		"lineNumber: " + e.lineNumber + ".\n" +
		"Error message: " + e.message;
	theApp.logging.njerror(message);

	//theApp.logging.njerror(this.stacktrace(e));
	theApp.prompts.njAlert(message);
},

/**
 * Unfortunately due to security concerns Mozilla deprecated the ability to dumpe a stacktrace.
 */
stacktrace: function (e)
{
	return "";
//	var e = new Error('dummy');
//	var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '') // remove lines without '('
//	  .replace(/^\s+at\s+/gm, '') // remove prefix text ' at '
//	  .split('\n');
	
//	var f = this.stacktrace;
//	var stack = "Stack trace:";
//	while (f)
//	{
//		if (f != this.stacktrace)
//			stack += "\n" + f.name;
//		f = f.caller;
//	}
//	return stack;

},

showTree: function (node)
{
	theApp.logging.njdebug("util", "showTree");
	while (node != null)
	{
		theApp.logging.njdebug("util", node + ":" + node.nodeName + ":" + node.nodeValue + (node.text != undefined ? (":" + node.text) : ""));
		node = node.parentNode;
	}
},



getWindowList: function ()
{
	var documentList = [];
	var count = 0;

	theApp.logging.njdebug("util", "getWindowList a");
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
	        .getService(Components.interfaces.nsIWindowMediator);
	var enumerator = wm.getEnumerator(null);
	while (enumerator.hasMoreElements())
	{
		var win = enumerator.getNext();

		theApp.logging.njdebug("util", win);
		if (win.content != undefined && this.isHtmlDocument(win.content.document))
		{
			documentList[count++] = win.content.document;
			theApp.logging.njdebug("util", "added=" + win.content.document);

		}
	}

	theApp.logging.njdebug("util", "winList count=" + count);
	return documentList;
},

/*
 * Returns the class name of the argument or undefined if it's not a valid
 * JavaScript object.
 */
getObjectClass: function (obj)
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
},


isHtmlDocument: function (object)
{
	var isHtml = false;
	var name = object.toString();

	if (name.indexOf("HTMLDocument") != -1)
	{
		isHtml = true;
	}
	return isHtml;
},

isDigit: function (str)
{
	var isDigit = false;

	if (str.length == 1)
	{
		var digits = "1234567890";
		if (digits.indexOf(str) != -1)
			isDigit = true;
	}
	return isDigit;
},

getParentDocument: function (element)
{
	theApp.logging.njdebug("util", "element=" + element);
	var doc = element;
	while (!(doc instanceof HTMLDocument))
	{
		doc = doc.parentNode;
		theApp.logging.njdebug("util", "doc=" + doc);
	}
	return doc;
},

// Retrieves the channel name of the users own extension (including technology)
// from the Noojee Click configuration.
getLocalChannel: function ()
{
	var channel = null;
	var extension = theApp.prefs.getValue("extension");
	
	if (extension != null)
	{
		if (extension.indexOf("/") == -1)
		{
			channel = "SIP/" + extension;
		}
		else
		{
			channel = extension;
		}
	}
	return channel;

},

extractChannel: function (uniqueChannel)
{
	var channel = uniqueChannel;

	var index = uniqueChannel.indexOf('-');
	if (index != -1)
	{
		channel = uniqueChannel.substring(0, index);
	}
	return channel;
}	,
	
//Tests if the given channel (from an event usually) matches the users
//local channel from Noojee Click's configuration.
isLocalChannel: function (channel)
{
	return this.extractChannel(channel).toLowerCase() == this.getLocalChannel().toLowerCase();
},

	

getSelectedText: function ()
{
	var selectedText = this.trim(theApp.phonepatterns.extractPhoneNo(this.trim(this.getRawSelectedText())));

	return selectedText;
},


getRawSelectedText: function ()
{
	var selectedText = "";
	selectedText = document.commandDispatcher.focusedWindow.getSelection().toString();
	return selectedText;
},

getClipboardText: function ()
{
	var pasteText = "";
	var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);
	if (!clip)
		return false;
	var trans = Components.classes["@mozilla.org/widget/transferable;1"]
	        .createInstance(Components.interfaces.nsITransferable);
	if (!trans)
		return false;

	trans.init(null);
	
	trans.addDataFlavor("text/unicode");

	clip.getData(trans, clip.kGlobalClipboard);
	var str = new Object();
	var strLength = new Object();
	try
	{
		trans.getTransferData("text/unicode", str, strLength);
		var temp = "";
		
		if (str)
		{
			str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
			temp = str.data.substring(0, strLength.value / 2);
			
			// remove duplicate strings
			temp = temp.replace(/\ \ /g, " ");
			theApp.logging.njdebug("util", "clipboard: removed doublspaces" + temp);
		}

		pasteText = temp;

	}
	catch (e)
	{
		// Clipboard is empty (we think)
		theApp.logging.njerror("clipboard access threw exception, may just be empty " + e);
	}

	return pasteText;
},

};

}});


