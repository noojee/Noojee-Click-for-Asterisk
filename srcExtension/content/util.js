function njlog(msg)
{
	if (getBoolValue("enableLogging") == true)
	{
		var now = new Date();
		var hour = now.getHours();
		var min = now.getMinutes();
		var sec = now.getSeconds();
		var mil = now.getMilliseconds();
		consoleService.logStringMessage(hour + ":" + min + ":" + sec + ":" + mil + " info: " + msg);
	}
}

function njdebug(module, msg)
{

	if (getBoolValue("enableDebugging") == true)
	{
		var filter = getValue("debugFilter");

		if (filter.search(module, "i") >= 0)
		{
			var now = new Date();
			var hour = now.getHours();
			var min = now.getMinutes();
			var sec = now.getSeconds();
			var mil = now.getMilliseconds();
			consoleService.logStringMessage(hour + ":" + min + ":" + sec + ":" + mil+ " debug (" + module + "): " + msg);
		}
	}
}

function njerror(msg)
{
		var now = new Date();
		var hour = now.getHours();
		var min = now.getMinutes();
		var sec = now.getSeconds();
		var mil = now.getMilliseconds();
		consoleService.logStringMessage(hour + ":" + min + ":" + sec + ":" + mil + " error: " + msg);
}

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
		var iLen = String(str).length;
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
	style.innerHTML = css;
	var head = document.getElementsByTagName('head')[0];
	if (head != null)
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
	if (noojeeStyle != null)
		hasStyle = true;
	njdebug("util", "hasStyle=" + hasStyle);
	return hasStyle;
}

function showError(response, message)
{
	njlog("showError r=" + response + " m=" + message);
	njAlert(message);
	//getStatusWindow().updateStatus(message);
}

function showException(method, e)
{
	njdebug("util", "Exception caught in method '" + method + "' " + e);
	var message = "An exeption occured in method '" + method + "' " + e.name + ". Error description: " + e.description
	        + ". Error number: " + e.number + ". Error message: " + e.message;
	njlog(message);

	njdebug("util", stacktrace());
	njAlert(message);
}

function stacktrace()
{
	var f = stacktrace;
	var stack = "Stack trace:";
	while (f)
	{
		if (f != stacktrace)
			stack += "\n" + f.name;
		f = f.caller;
	}
	return stack;

}

function showTree(node)
{
	njdebug("util", "showTree");
	while (node != null)
	{
		njdebug("util", node + ":" + node.nodeName + ":" + node.nodeValue + (node.text != undefined ? (":" + node.text) : ""));
		node = node.parentNode;
	}
}



function getWindowList()
{
	var documentList = [];
	var count = 0;

	njdebug("util", "getWindowList a");
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
	        .getService(Components.interfaces.nsIWindowMediator);
	var enumerator = wm.getEnumerator(null);
	while (enumerator.hasMoreElements())
	{
		var win = enumerator.getNext();

		njdebug("util", win);
		if (win.content != undefined && isHtmlDocument(win.content.document))
		{
			documentList[count++] = win.content.document;
			njdebug("util", "added=" + win.content.document);

		}
	}

	njdebug("util", "winList count=" + count);
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
	njdebug("util", "element=" + element);
	var doc = element;
	while (!(doc instanceof HTMLDocument))
	{
		doc = doc.parentNode;
		njdebug("util", "doc=" + doc);
	}
	return doc;
}

// Retrieves the channel name of the users own extension (including technology)
// from the Noojee Click configuration.
function getLocalChannel()
{
	var channel = null;
	var extension = getValue("extension");
	
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
	return extractChannel(channel).toLowerCase() == getLocalChannel().toLowerCase();
}

	
function getStatusWindow()
{
	if (statusWindow == null)
	{
		njdebug("util", "statusWindow=null");
		stacktrace();
	}
	
	return statusWindow;
}

function getSelectedText()
{
	var selectedText = extractPhoneNo(trim(getRawSelectedText()));

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

	trans.addDataFlavor("text/unicode");

	clip.getData(trans, clip.kGlobalClipboard);
	var str = new Object();
	var strLength = new Object();
	try
	{
		trans.getTransferData("text/unicode", str, strLength);
		if (str)
			str = str.value.QueryInterface(Components.interfaces.nsISupportsString);

		var temp = "";
		if (str)
			temp = str.data.substring(0, strLength.value / 2);

		pasteText = trim(extractPhoneNo(temp));

	}
	catch (e)
	{
		// Clipboard is empty (we think)
		njlog("clipboard access threw exception, may just be empty " + e);
	}

	return pasteText;
}



