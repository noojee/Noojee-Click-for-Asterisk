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



var util = ( function( window, undefined ) 
{
	var instance = null;
	  
	// revealing module pattern that handles initialization of our new module
	function initializeNewModule() 
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
		
		function isRClick(e)
		{
			var emod = (e) ? (e.eventPhase) ? "W3C" : "NN4" : (window.event) ? "IE4+" : "unknown";
		
			return (emod == "NN4") ? (e.which > 1) : (e.button == 2);
		}
		
		
		function addGlobalStyle(document, css)
		{
			var success = false;
			var style = document.createElement("style");
			style.setAttribute("noojeeclick", "true");
			style.id = "noojeeClickStyle";
			style.type = "text/css";
			style.textContent = css;
			var head = document.getElementsByTagName('head')[0];
			if (head !== null)
			{
				head.appendChild(style);
				success = true;
			}
		
			return success;
		}
		
		function hasGlobalStyle(document)
		{
			var hasStyle = false;
		
			var noojeeStyle = document.getElementById("noojeeClickStyle");
			if (noojeeStyle !== null)
				hasStyle = true;
			logging.getInstance().njdebug("util", "hasStyle=" + hasStyle);
			return hasStyle;
		}
		
		function showError(response, message)
		{
			logging.getInstance().njerror("showError r=" + response + " m=" + message);
			prompts.njAlert(message);
			//dialstatus.getInstance().updateStatus(message);
		}
		
		function showException(method, e)
		{
			var message = 
				"An exeption occured in method '" + method + "' " + e.name + ".\n" +
				"filename: " + e.filename + ".\n" +
				"lineNumber: " + e.lineNumber + ".\n" +
				"Error message: " + e.message;
			logging.getInstance().njerror(message);
		
			//logging.getInstance().njerror(this.stacktrace(e));
			prompts.njAlert(message);
		}
		
		/**
		 * Unfortunately due to security concerns Mozilla deprecated the ability to dumpe a stacktrace.
		 */
		function stacktrace(e)
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
		
		
		
		function getWindowList()
		{
			var documentList = [];
			var count = 0;
		
			logging.getInstance().njdebug("util", "getWindowList a");
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			        .getService(Components.interfaces.nsIWindowMediator);
			var enumerator = wm.getEnumerator(null);
			while (enumerator.hasMoreElements())
			{
				var win = enumerator.getNext();
		
				logging.getInstance().njdebug("util", win);
				if (win.content !== undefined && this.isHtmlDocument(win.content.document))
				{
					documentList[count++] = win.content.document;
					logging.getInstance().njdebug("util", "added=" + win.content.document);
		
				}
			}
		
			logging.getInstance().njdebug("util", "winList count=" + count);
			return documentList;
		}
		
		/*
		 * Returns the class name of the argument or undefined if it's not a valid
		 * JavaScript object.
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
		
		
		function isHtmlDocument(object)
		{
			var isHtml = false;
			var name = object.toString();
		
			if (name.indexOf("HTMLDocument") != -1)
			{
				isHtml = true;
			}
			return isHtml;
		}
		
		function isDigit(str)
		{
			var isDigit = false;
		
			if (str.length == 1)
			{
				var digits = "1234567890";
				if (digits.indexOf(str) != -1)
					isDigit = true;
			}
			return isDigit;
		}
		
		function getParentDocument(element)
		{
			logging.getInstance().njdebug("util", "element=" + element);
			var doc = element;
			while (!(doc instanceof HTMLDocument))
			{
				doc = doc.parentNode;
				logging.getInstance().njdebug("util", "doc=" + doc);
			}
			return doc;
		}
		
		// Retrieves the channel name of the users own extension (including technology)
		// from the Noojee Click configuration.
		function getLocalChannel()
		{
			var channel = null;
			var extension = options.getInstance().getValue("extension");
			
			if (extension !== null)
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
		
		}
		
		function extractChannel(uniqueChannel)
		{
			var channel = uniqueChannel;
		
			var index = uniqueChannel.indexOf('-');
			if (index != -1)
			{
				channel = uniqueChannel.substring(0, index);
			}
			return channel;
		}	
			
		//Tests if the given channel (from an event usually) matches the users
		//local channel from Noojee Click's configuration.
		function isLocalChannel(channel)
		{
			return this.extractChannel(channel).toLowerCase() == this.getLocalChannel().toLowerCase();
		}
		
			
		
		function getSelectedText()
		{
			var selectedText = this.trim(phonepatterns.extractPhoneNo(this.trim(this.getRawSelectedText())));
		
			return selectedText;
		}
		
		
		function getRawSelectedText()
		{
			var selectedText = "";
			selectedText = document.commandDispatcher.focusedWindow.getSelection().toString();
			return selectedText;
		}
		
		function getClipboardText()
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
			var str = "";
			var strLength ={};
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
					logging.getInstance().njdebug("util", "clipboard: removed doublspaces" + temp);
				}
		
				pasteText = temp;
		
			}
			catch (e)
			{
				// Clipboard is empty (we think)
				logging.getInstance().njerror("clipboard access threw exception, may just be empty " + e);
			}
		
			return pasteText;
		}
		
		return 
		{
			Right : Right,
			Left : Left,
			trim : trim,
			ltrim : ltrim,
			rtrim : rtrim,
			isRClick : isRClick,
			showError : showError,
			showTree : showTree,
			getWindowList : getWindowList,
			getObjectClass : getObjectClass,
			isHtmlDocument : isHtmlDocument,
			isDigit: isDigit,
			getParentDocument : getParentDocument,
			getLocalChannel :getLocalChannel,
			extractChannel : extractChannel,
			isLocalChannel : isLocalChannel,
			getSelectedText : getSelectedText,
			getRawSelectedText: getRawSelectedText, 
			getClipboardText : getClipboardText
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
