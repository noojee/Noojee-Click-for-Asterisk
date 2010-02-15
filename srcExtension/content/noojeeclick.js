// Noojee Click for Asterisk
// Author: Brett Sutton
// Copyright: Noojee IT
//
// License: you are free to use Noojee Click as is but may not redistribute the
// code without prior permission.
// Use at your own risk ;)
// AutoAnswer SIP headers
//
// If you phone isn't supported then just copy one of the following lines and
// add your entry. Thats all that is required to support new auto answer headers.
//

/** 
  * set up a namespace to avoid polluting Mozilla's namespace
  */
//let noojeeClick = {

Components.utils.import("resource://noojeeclick/asterisk.jsm");
Components.utils.import("resource://noojeeclick/constants.jsm");
Components.utils.import("resource://noojeeclick/prompts.jsm");
Components.utils.import("resource://noojeeclick/util.jsm");
Components.utils.import("resource://noojeeclick/prefs.jsm");
Components.utils.import("resource://noojeeclick/monitor.jsm");
Components.utils.import("resource://noojeeclick/statusbar.jsm");


// globals
var host = '10.10.0.124';
var port = '8088';
var username;
var password;
var extension;
var context;
var dialPrefix;
var internationalPrefix;
var pattern;
var initialised = false;
var loggingEnabled = false
var enableAutoAnswer = false;
var handsetType = autoAnswerList[0].manufacturer;


var ie = window.document.all
var ns6 = window.document.getElementById && !window.document.all




window.addEventListener("load", init, true);


function init()
{
	try
	{
		njdebug("noojeeclick", "init");
		prompt.init(window);
		statusbar.init(window);
		gAsterisk.init(new XMLHttpRequest(), new DOMParser());
	
		/*
		 * initialise the api so that standard html pages can call us TODO: we
		 * should probably secure this so that users can control what pages have
		 * access.
		 */
		njAPIinit();
		
		var myListener = new prefListener("extensions.noojeeclick.", function(branch, name)
		{
			switch (name)
			{
				case "pattern":
					onRefresh();
					break;
			}
		});
		njdebug("noojeeclick", "registering Preference Observer.")
		myListener.register();

		// Hook the page load event
		var appcontent = window.document.getElementById("appcontent");
		if (appcontent != undefined && appcontent != null)
			appcontent.addEventListener("DOMContentLoaded", onPageLoad, false);
		else
			njlog("appcontent returned null, can't install page handler");

		// Add a context menu handler so we can dynamically show/hide specific menu items.
		var contextMenu = document.getElementById("contentAreaContextMenu");
		njdebug("noojeeclick", "contextMenu=" + contextMenu);
		if (contextMenu)
			contextMenu.addEventListener("popupshowing", showMenuHideItems, false);

		njdebug("noojeeclick", "Init completed");
	}
	catch (e)
	{
		njlog(e);
		prompt.exception("init", e);
	}

}

function onPageLoad(e)
{
	var document = e.originalTarget; // = window.content.document
	
	njAPIonLoad(document);
	
	njdebug("noojeeclick", "onPageLoad called");
	try
	{

		if (getBoolValue("enabled") == true)
		{
			if (hasGlobalStyle(document) == true)
				return;

			// If we can't add the global styles then we have a major problem
			if (addGlobalStyle(document, css))
			{
		
				if (getBoolValue("monitor") == true)
					new Monitor().init(document);

				addClickToDialLinks(document);
			}
			else
				njerror("noojeeclick", "Loading of Styles failed so init terminated");
		}
	}
	catch (e)
	{
		njlog(e);
		prompt.exception("noojeeclick", e);
	}
}

/** Popup a dialog with the selected telephone number
 * and allow the user to edit it before dialing the number
 */
function onDialDifferently(e)
{
	njlog('Dial differently');

	var obj = ns6 ? e.target : event.srcElement;
	doDialDifferently(obj);
}

/**
 * dial the number associated with the click Noojee Click icon
 */
function onDial(e)
{
	njlog("onDial");
	var obj = ns6 ? e.target : event.srcElement;
	var phoneNo = obj.getAttribute("phoneNo");

	if (phoneNo == null || phoneNo.length == 0)
		prompt.alert("Please enter a phone number.");
	else
	{
		if (navigator.onLine)
		{
			gAsterisk.dial(phoneNo);
		}
		else
			prompt.alert("The browser must be online in order to dial.");
	}
	
	

	return true;
}

/**
 * Answer an incoming call.
 *
 * TODO: actually finish implementing this
 */
function onAnswer(e)
{
	njlog("onAnswer");
	gAsterisk.answer();

	return true;
}

/**
 * Dial the number currently 'selected' when the user dragged their mouse
 * over a phone number. We confirm the number with the user before dialling.
 *
 */
function dialSelectionMenuAction()
{
	njdebug("noojeeclick", "dialSelectionMenuAction called");
	var phoneNo = getSelectedText();
	if (phoneNo == null || phoneNo.length == 0)
	{
		prompt.alert("Please select a phone number first");
		return;
	}

	var result = prompt.prompt("Confirm number to dial.", phoneNo);
	if (result.OK == true && result.value != null)
	{
		phoneNo = result.value;
		if (phoneNo.length == 0)
			prompt.alert("Please enter a phone number.");
		else if (navigator.onLine)
		{
			gAsterisk.dial(phoneNo);
		}
		else
			prompt.alert("The browser must be online in order to dial.");
	}
}

/** 
 * Dial the number currently on the clipboard.
 * We start by stripping any non-phone number characters
 * display the remainder (hopfully a phone number) to the 
 * user and allow them to click 'dial' to dial the number.
 * TODO: some allowed characters such as '+' may only occur
 *  once and at the begining of the number so we should
 *  strip subsequent characters out.
 */
function dialFromClipboardMenuAction()
{
	var phoneNo = getClipboardText();

	var result = prompt.prompt("Confirm number to dial.", phoneNo);
	if (result.OK == true && result.value != null)
	{
		phoneNo = result.value;
		if (phoneNo.length == 0)
			prompt.alert("Please enter a phone number.");
		else if (navigator.onLine)
		{
			gAsterisk.dial(phoneNo);
		}
		else
			prompt.alert("The browser must be online in order to dial.");

	}
}

/**
 * Display the click phone number and allow the user
 * to edit it before dialing the number.
 */
function dialDifferentlyMenuAction(target)
{
	target = document.popupNode;
	njdebug("noojeeclick", "target=" + target);

	// if (target.onImage)
	{
		doDialDifferently(target);
	}
	// else
	// prompt.alert("Dial differently only works on the Noojee Click dial icon");
}

/**
 * Display the click phone number and allow the user
 * to edit it before dialing the number.
 */
function doDialDifferently(target)
{
	var phoneNo = target.getAttribute("phoneNo");
	var result = prompt.prompt("Enter number to dial.", phoneNo);
	if (result.OK == true && result.value != null)
	{
		phoneNo = result.value;
		if (phoneNo.length == 0)
			prompt.alert("Please enter a phone number.");
		else if (navigator.onLine)
		{
			gAsterisk.dial(phoneNo);
		}
		else
			prompt.alert("The browser must be online in order to dial.");

	}
}

/**
 * Handler for the dial menu item.
 */

function dialMenuAction()
{
	var phoneNo = "";
	var result = prompt.prompt("Enter number to dial.", phoneNo);
	if (result.OK == true && result.value != null)
	{
		phoneNo = result.value;
		if (phoneNo.length == 0)
			prompt.alert("Please enter a phone number.");
		else if (navigator.onLine)
		{
			gAsterisk.dial(phoneNo);
		}
		else
			prompt.alert("The browser must be online in order to dial.");

	}
}

/**
 * Handler for the 'redial' menu item.
 */
function redialMenuAction()
{
	njdebug("noojeeclick", "redialMenuAction called");
	var phoneNo = getValue("lastDialed");
	if (phoneNo != null && phoneNo.length > 0)
	{
		gAsterisk.dial(phoneNo);
	}
	else
		prompt.alert("Redial string is empty."); // this shouldn't happen.
}

/**
 * Allows a user to 'select' a non-recognized phone number
 * and automatically generates a pattern that number.
 * The pattern is show to the user for any adjustments
 * and then added to the current list of Patterns.
 */
function onAddDialPatternMenuAction()
{
	var fault = false;
	var phoneNo = getRawSelectedText();
	if (phoneNo == null || trim(phoneNo).length == 0)
	{
		prompt.alert("Please select a phone number first");
		return;
	}

	// transpose the phone number into a pattern
	phoneNo = trim(phoneNo);
	var newPattern = "";
	var delimiters = getValue("delimiters");
	for ( var i = 0; i < phoneNo.length; i++)
	{
		if (delimiters.indexOf(phoneNo[i]) != -1)
			newPattern += phoneNo[i];
		else
		{
			switch (phoneNo[i])
			{
				case '0':
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
					newPattern += 'X';
					break;
				case '+':
					newPattern += '+';
					break;
				case '.':
					newPattern += '.';
					break;
				case ' ':
					newPattern += ' ';
					break;
				default:
					prompt.alert("Unsupported character found in phone number: '" + phoneNo[i] + "'");
					fault = true;
					break;

			}
		}
	}

	if (!fault)
	{
		var result = prompt.prompt("Add pattern for " + phoneNo + "?", newPattern);
		if (result.OK == true && result.value != null)
		{
			newPattern  = result.value;

			if (newPattern.length != 0)
			{
				var patternList = getValue("pattern");
				patternList += "\n" + newPattern;
				setValue("pattern", patternList);
				pattern = newPattern;
				onRefresh();
			}
		}
	}
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

/**
 * Handler for the context menu. 
 * Hides any menu items which currently arn't valid
 */
function showMenuHideItems(event)
{
	var visibleItems = 3;
	try
	{
		njdebug("noojeeclick", "showMenuHideItems event=" + event);
		njdebug("noojeeclick", "document.popupNode=" + document.popupNode);

		njdebug("noojeeclick", "popupNode name=" + document.popupNode.hasAttribute("name"));

		if (document.popupNode.hasAttribute("name"))
		{
			if (document.popupNode.getAttribute("name") == "noojeeClickImg")
			{
				njdebug("noojeeclick", "noojeeClickImg");
				menuItem = document.getElementById("njcontextDialDifferently");
				menuItem.hidden = false;
			}
			else
			{
				njdebug("noojeeclick", "not noojee ClickImg");
				menuItem = document.getElementById("njcontextDialDifferently");
				menuItem.hidden = true;
				visibleItems--;
			}
		}
		else
		{
			njdebug("noojeeclick", "not noojee ClickImg");
			menuItem = document.getElementById("njcontextDialDifferently");
			menuItem.hidden = true;
			visibleItems--;
		}

		if (gContextMenu.isTextSelected)
		{
			njdebug("noojeeclick", "popup - text selected");
			menuItem = document.getElementById("njcontextDialSelection");
			menuItem.hidden = false;
			menuItem = document.getElementById("njcontextDialAddPattern");
			menuItem.hidden = false;

		}
		else
		{
			njdebug("noojeeclick", "popup - text not selected");
			menuItem = document.getElementById("njcontextDialSelection");
			menuItem.hidden = true;
			visibleItems--;
			menuItem = document.getElementById("njcontextDialAddPattern");
			menuItem.hidden = true;
			visibleItems--;
		}

		if (visibleItems == 0)
		{
			njdebug("noojeeclick", "removing separator");
			// all of the menu items have been suppressed so remove the
			// separator.
			menuItem = document.getElementById("njcontextSeparator");
			menuItem.hidden = true;
		}
	}
	catch (e)
	{
		prompt.exception("showMenuHideItems", e);
		prompt.error(e);
	}

}

// Display tooltip
function onMouseOver(e)
{
	njdebug("noojeeclick", "onMouseOver");
}

// Display tooltip
function onMouseOut(e)
{
	njdebug("noojeeclick", "onMouseOut");
}

// Just do the simple dial
function onDialHandler(e)
{
	njdebug("noojeeclick", "onDialHandler");
	try
	{
		njdebug("noojeeclick", "onDialHandler");

		if (!e)
			e = window.event;
		if (!isRClick(e))
		{
			onDial(e);
		}
	}
	catch (e)
	{
		njlog(e);
		prompt.exception("onDialHandler", e);
	}
}



/*
* Called when the users clicks the 'Hangup' button on the status bar
* 
*/
function onHangup()
{
	njlog("onHangup");
	gAsterisk.hangup();
	statusbar.resetIcon();
}

function onDialDifferentlyShowing(menu)
{
	njdebug("noojeeclick", "onDialDifferentlyShowing");
	var menuItem = document.getElementById('njcontextDialDifferently');
	menuItem.setAttribute("checked", enabled);
}

function onDialSelectionShowing(menu)
{
	njdebug("noojeeclick", "onDialSelectionShowing called");
	var selected = getSelectedText();
	if (selected == null || selected.length == 0)
	{
		var menuItem = document.getElementById('njcontextDialSelection');
		menuItem.hidden = true;
	}
}

function onDialAddPatternShowing(menu)
{
	var selected = getSelectedText();
	if (selected == null || selected.length == 0)
	{
		var menuItem = document.getElementById('njcontextDialAddPattern');
		menuItem.hidden = true;
	}
}

function onEnableShowing(menu)
{
	njdebug("noojeeclick", "onEnableShowing called");
	var enabled = getBoolValue("enabled");
	var enableMenu = document.getElementById('menu_Enable');
	enableMenu.setAttribute("checked", enabled);
}

function onRedialShowing(menu)
{
	njdebug("noojeeclick", "onRedialShowing called");
	var lastDialed = getValue("lastDialed");
	var redialMenu = document.getElementById('menu_Redial');
	if (lastDialed != null && lastDialed.length > 0)
	{
		redialMenu.label = "Redial: " + lastDialed;
		redialMenu.hidden = false;
	}
	else
		redialMenu.hidden = true;
}

/**
 * Called when the status of NoojeeClick is toggled between enabled/disabled.
 * Each time we are enabled we re-initialise Asterisk
 */
function onEnable()
{
	var enabled = getBoolValue("enabled");
	enabled = !enabled;
	setBoolValue("enabled", enabled);
	onRefresh();
	if (enabled == true)
		gAsterisk.init();
}

	
//}; // end of noojeeClick scope


