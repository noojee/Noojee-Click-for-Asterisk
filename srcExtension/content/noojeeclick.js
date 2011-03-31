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


noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.noojeeclick =
{

autoAnswerList: [
{
    manufacturer :"Aastra",
    header :"'Call-Info: Answer-After=0"
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
],

serverTypeList: [
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
} ],

// globals
ie : window.document.all,
ns6 : window.document.getElementById && !window.document.all,


onPageLoad: function (e)
{
	var document = e.originalTarget; // = window.content.document
	
	theApp.api.njAPIonLoad(document);
	
	theApp.util.njdebug("noojeeclick", "onPageLoad called");
	try
	{

		if (theApp.prefs.getBoolValue("enabled") == true)
		{
			if (theApp.util.hasGlobalStyle(document) == true)
				return;

			// Not actually used except as a flag to tell us we have already initialized the
			// page.
			var css = ".NoojeeClickInstalled { }";

			// If we can't add the global styles then we have a major problem
			if (theApp.util.addGlobalStyle(document, css))
			{
				if (theApp.prefs.getBoolValue("monitor") == true)
					new theApp.monitor.Monitor().init(document);

				theApp.render.addClickToDialLinks(document);
			}
			else
				theApp.util.njerror("Loading of Styles failed so init terminated");
		}
	}
	catch (e)
	{
		theApp.util.njlog(e);
		theApp.util.showException("onPageLoad", e);
	}
},


onDialDifferently: function (e)
{
	theApp.util.njlog('Dial differently');

	var obj = ns6 ? e.target : event.srcElement;
	this.doDialDifferently(obj);
},

onDial: function (e)
{
	theApp.util.njlog("onDial");
	var obj = ns6 ? e.target : event.srcElement;
	var phoneNo = obj.getAttribute("phoneNo");

	if (phoneNo == null || phoneNo.length == 0)
		theApp.prompts.njAlert("Please enter a phone number.");
	else
		theApp.asterisk.getInstance().dial(phoneNo);

	return true;
},

onAnswer: function (e)
{
	theApp.util.njlog("onAnswer");
	theApp.asterisk.getInstance().answer();

	return true;
},



showMenuHideItems: function (event)
{
	var visibleItems = 3;
	try
	{
		theApp.util.njdebug("noojeeclick", "showMenuHideItems event=" + event);
		theApp.util.njdebug("noojeeclick", "document.popupNode=" + document.popupNode);

		theApp.util.njdebug("noojeeclick", "popupNode name=" + document.popupNode.hasAttribute("name"));

		if (document.popupNode.hasAttribute("name"))
		{
			if (document.popupNode.getAttribute("name") == "noojeeClickImg")
			{
				theApp.util.njdebug("noojeeclick", "noojeeClickImg");
				var menuItem = document.getElementById("njcontextDialDifferently");
				menuItem.hidden = false;
			}
			else
			{
				theApp.util.njdebug("noojeeclick", "not noojee ClickImg");
				var menuItem = document.getElementById("njcontextDialDifferently");
				menuItem.hidden = true;
				visibleItems--;
			}
		}
		else
		{
			theApp.util.njdebug("noojeeclick", "not noojee ClickImg");
			var menuItem = document.getElementById("njcontextDialDifferently");
			menuItem.hidden = true;
			visibleItems--;
		}

		if (gContextMenu.isTextSelected)
		{
			theApp.util.njdebug("noojeeclick", "popup - text selected");
			var menuItem = document.getElementById("njcontextDialSelection");
			menuItem.hidden = false;
			menuItem = document.getElementById("njcontextDialAddPattern");
			menuItem.hidden = false;

		}
		else
		{
			theApp.util.njdebug("noojeeclick", "popup - text not selected");
			var menuItem = document.getElementById("njcontextDialSelection");
			menuItem.hidden = true;
			visibleItems--;
			menuItem = document.getElementById("njcontextDialAddPattern");
			menuItem.hidden = true;
			visibleItems--;
		}

		if (visibleItems == 0)
		{
			theApp.util.njdebug("noojeeclick", "removing separator");
			// all of the menu items have been suppressed so remove the
			// separator.
			var menuItem = document.getElementById("njcontextSeparator");
			menuItem.hidden = true;
		}
	}
	catch (e)
	{
		theApp.util.showException("showMenuHideItems", e);
		theApp.prompts.njAlert(e);
	}

},



showHangupIcon: function ()
{
	theApp.util.njdebug("noojeeclick", "showHangupIcon");
	var menuIcon = window.document.getElementById("noojeeMenu");
	menuIcon.hidden = true;
	
	var hangupIcon= window.document.getElementById("noojeeHangup");
	hangupIcon.hidden = false;
	
// // change the status bar icon to the hangup icon and disable the contextmenu
// statuspanel.image = "chrome://noojeeclick/content/images/hangup.png";
// statuspanel.addEventListener("click", theApp.handlers.onHangup, false);
// //statuspanel.style = "statusbarpanel-iconic";
// statuspanel.contextMenu = "";
	
	
},

resetIcon: function ()
{
	theApp.util.njdebug("noojeeclick", "resetIcon");
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
	
},



onDialDifferentlyShowing: function (menu)
{
	theApp.util.njdebug("noojeeclick", "onDialDifferentlyShowing");
	var menuItem = document.getElementById('njcontextDialDifferently');
	menuItem.setAttribute("checked", enabled);
},

onDialSelectionShowing: function (menu)
{
	theApp.util.njdebug("noojeeclick", "onDialSelectionShowing called");
	var selected = theApp.util.getSelectedText();
	if (selected == null || selected.length == 0)
	{
		var menuItem = document.getElementById('njcontextDialSelection');
		menuItem.hidden = true;
	}
},

onDialAddPatternShowing: function (menu)
{
	var selected = theApp.util.getSelectedText();
	if (selected == null || selected.length == 0)
	{
		var menuItem = document.getElementById('njcontextDialAddPattern');
		menuItem.hidden = true;
	}
},

onEnableShowing: function (menu)
{
	theApp.util.njdebug("noojeeclick", "onEnableShowing called");
	var enabled = theApp.prefs.getBoolValue("enabled");
	var enableMenu = document.getElementById('menu_Enable');
	enableMenu.setAttribute("checked", enabled);
},

onRedialShowing: function (menu)
{
	theApp.util.njdebug("noojeeclick", "onRedialShowing called");
	var lastDialed = theApp.prefs.getValue("lastDialed");
	var redialMenu = document.getElementById('menu_Redial');
	if (lastDialed != null && lastDialed.length > 0)
	{
		redialMenu.label = "Redial: " + lastDialed;
		redialMenu.hidden = false;
	}
	else
		redialMenu.hidden = true;
}

}

}});



