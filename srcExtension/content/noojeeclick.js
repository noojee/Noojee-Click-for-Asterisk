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
const
autoAnswerList = [
{
    manufacturer :"Aastra",
    header :"Call-Info:\\\\; answer-after=0"
},
{
    manufacturer :"GrandStream",
    header :"Call-Info:\\\\; answer-after=0"
},
{
    manufacturer :"Linksys",
    header :"Call-Info:\\\\; answer-after=0"
},
{
    manufacturer :"Polycom",
    header :"Alert-Info: Ring Answer"
},
{
    manufacturer :"Snom",
    header :"Call-Info:\\\\; answer-after=0"
},
{
    manufacturer :"Yealink",
    header :"Call-Info:\\\\; answer-after=0"
}
];

var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService);

var reportError = Components.utils.reportError;

const
serverTypeList = [
{
    type :"Astmanproxy",
    description :"Astmanproxy"
},
{
    type :"AJAM",
    description :"AJAM (Asterisk 1.4+)"
},
{
    type :"NJVision",
    description :"Noojee Vision"
} ];

// Not actually used except as a flag to tell us we have already initialized the
// page.
const
css = ".NoojeeClickInstalled { }";

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
var serverType = serverTypeList[0].type;

var ie = window.document.all
var ns6 = window.document.getElementById && !window.document.all


var statusWindow = new dialStatus();

window.addEventListener("load", init, true);

// Login and begin monitoring events

if (gAsterisk == null)
{
	gAsterisk = new Asterisk();
	gAsterisk.init();
}

function init()
{
	// var contextMenu = document.getElementById("contentAreaContextMenu");

	try
	{
		njdebug("noojeeclick", "init");
		/*
		 * initialise the api so that standard html pages can call us TODO: we
		 * should probably secure this so that users can control what pages have
		 * access.
		 */
		njAPIinit();
		
		statusWindow = new dialStatus();

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
		showException("init", e);
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
				getValues();
				
				if (getBoolValue("monitor") == true)
					new Monitor().init(document);

				addClickToDialLinks(document);
			}
			else
				njerror("Loading of Styles failed so init terminated");
		}
	}
	catch (e)
	{
		njlog(e);
		showException("onPageLoad", e);
	}
}


function onDialDifferently(e)
{
	njlog('Dial differently');

	var obj = ns6 ? e.target : event.srcElement;
	doDialDifferently(obj);
}

function onDial(e)
{
	njlog("onDial");
	var obj = ns6 ? e.target : event.srcElement;
	var phoneNo = obj.getAttribute("phoneNo");

	if (phoneNo == null || phoneNo.length == 0)
		njAlert("Please enter a phone number.");
	else
		gAsterisk.dial(phoneNo);

	return true;
}

function onAnswer(e)
{
	njlog("onAnswer");
	gAsterisk.answer();

	return true;
}



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
		showException("showMenuHideItems", e);
		njAlert(e);
	}

}


function dialStatus()
{
	this.updateStatus = function(status)
	{
		var statusWindow = window.document.getElementById('noojeeStatus');
		
		if (statusWindow != null)
		{
			if (status == null || trim(status).length == 0)
			{
				// Hide the status window when not in use.
				statusWindow.hidden = true;
				statusWindow.label = "";
			}
			else
			{
				statusWindow.hidden = false;
				statusWindow.label = status;
			}
		}
	}
	
	
} ;

function showHangupIcon()
{
	njdebug("noojeeclick", "showHangupIcon");
	var menuIcon = window.document.getElementById("noojeeMenu");
	menuIcon.hidden = true;
	
	var hangupIcon= window.document.getElementById("noojeeHangup");
	hangupIcon.hidden = false;
	
// // change the status bar icon to the hangup icon and disable the contextmenu
// statuspanel.image = "chrome://noojeeclick/content/images/hangup.png";
// statuspanel.addEventListener("click", onHangup, false);
// //statuspanel.style = "statusbarpanel-iconic";
// statuspanel.contextMenu = "";
	
	
}

function resetIcon()
{
	njdebug("noojeeclick", "resetIcon");
	var menuIcon = window.document.getElementById("noojeeMenu");
	if (menuIcon != null)
		menuIcon.hidden = false;
	else
		njlog("Error retrieving the Noojee Menu Icon");
	
	var hangupIcon= window.document.getElementById("noojeeHangup");
	if (hangupIcon != null)
		hangupIcon.hidden = true;
	else
		njlog("Error retrieving the Noojee Hangup Icon");
		
	
// var statuspanel = window.document.getElementById("noojeeMenu");
// // reset the status bar icon and enable the contextmenu.
// statuspanel.image = "chrome://noojeeclick/content/images/small.png";
// statuspanel.contextMenu = "menuDial";
// //statuspanel.style = "statusbarpanel-menu-iconic";
// statuspanel.removeEventListener("click", onHangup, false);
	
}

/*
* Called when the users clicks the 'Hangup' button on the status bar
* 
*/
function onHangup()
{
	njlog("onHangup");
	gAsterisk.hangup();
	resetIcon();

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

function onEnable()
{
	var enabled = getBoolValue("enabled");
	enabled = !enabled;
	setBoolValue("enabled", enabled);
	onRefresh();
	if (enabled == true)
		gAsterisk.init();
}
	
