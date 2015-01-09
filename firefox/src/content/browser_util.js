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

theApp.browserutil =
{

/**
 * Iterates over a list of open documents calling the callback
 * function for each documents.
 * usage
 *  documentIterator(function(document) {
 * 		// Use window.
 * 	});
 */		
documentIterator: function (callback)
{
	theApp.logging.njdebug("util", "windowIterator");
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
	        .getService(Components.interfaces.nsIWindowMediator);
	var enumerator = wm.getEnumerator(null);
	while (enumerator.hasMoreElements())
	{
		var win = enumerator.getNext();

		theApp.logging.njdebug("util", win);
		if (win.content != undefined && this.isHtmlDocument(win.content.document))
		{
			if (callback != null)
			{
				callback(win.content.document);
				theApp.logging.njdebug("util", "callback to=" + win.content.document);
			}
		}
	}

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


