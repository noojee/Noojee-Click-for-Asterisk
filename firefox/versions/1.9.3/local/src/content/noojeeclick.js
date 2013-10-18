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

noojeeClick.ns(function()
{
	with (noojeeClick.LIB)
	{

		theApp.noojeeclick =
		{

		    autoAnswerList : [
		    {
		        manufacturer : "Aastra",
		        header : "'Call-Info: Answer-After=0"
		    },
		    {
		        manufacturer : "GrandStream",
		        header : "Call-Info:\\\\; answer-after=0"
		    },
		    {
		        manufacturer : "Linksys",
		        header : "Call-Info:\\\\; answer-after=0"
		    },
		    {
		        manufacturer : "Polycom",
		        header : "Alert-Info: Ring Answer"
		    },
		    {
		        manufacturer : "Snom",
		        header : "Call-Info:\\\\; answer-after=0"
		    },
		    {
		        manufacturer : "Yealink",
		        header : "Call-Info:\\\\; answer-after=0"
		    } ],

		    serverTypeList : [
		    {
		        type : "Astmanproxy",
		        description : "Astmanproxy"
		    },
		    {
		        type : "AJAM",
		        description : "AJAM (Asterisk 1.4+)"
		    },
		    {
		        type : "NJVision",
		        description : "Noojee Vision"
		    } ],

		    /*
			 * Called when a page finishes loading This is hooked by the
			 * namespace.initialise()
			 */
		    onPageLoad : function(e)
		    {
			    // We set a timer so that we don't slow down the page load
			    // This effectively pushes the rendering into the background
			    var document = e.originalTarget;
			    var self = this;
			    window.setTimeout(function(self)
			    {
				    self.onPageLoadCallback(document);
			    }, 0, self);
		    },

		    /**
			 * Called by a timer set in onPageLoad so that we do this in the
			 * background rather than making the user wait for us to complete
			 * the rendering.
			 */
		    onPageLoadCallback : function(document)
		    {

			    theApp.api.njAPIonLoad(document);

			    theApp.util.njdebug("noojeeclick", "onPageLoad called");
			    try
			    {

				    if (theApp.prefs.getBoolValue("showClickIcons") == true)
				    {
					    if (theApp.util.hasGlobalStyle(document) == true) return;

					    // Not actually used except as a flag to tell us we have
					    // already initialized the
					    // page.
					    var css = ".NoojeeClickInstalled { }";

					    // If we can't add the global styles then we have a
					    // major problem
					    if (theApp.util.addGlobalStyle(document, css))
					    {
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

		    onDialDifferently : function(e)
		    {
			    theApp.util.njlog('Dial differently');

			    var obj = e.target||e.srcElement;
			    this.doDialDifferently(obj);
		    },

		    onDial : function(e)
		    {
			    theApp.util.njlog("onDial");
			    var obj = e.target||e.srcElement;
			    var phoneNo = obj.getAttribute("phoneNo");

			    if (phoneNo == null || phoneNo.length == 0)
				    theApp.prompts.njAlert("Please enter a phone number.");
			    else
				    theApp.asterisk.getInstance().dial(phoneNo);

			    return true;
		    },

		    onAnswer : function(e)
		    {
			    theApp.util.njlog("onAnswer");
			    theApp.asterisk.getInstance().answer();

			    return true;
		    },

		    showMenuHideItems : function(event)
		    {
			    var visibleItems = 3;
			    try
			    {
				    theApp.util.njdebug("noojeeclick", "showMenuHideItems event=" + event);
				    theApp.util.njdebug("noojeeclick", "document.popupNode=" + document.popupNode);

				    theApp.util.njdebug("noojeeclick", "popupNode name=" + document.popupNode.hasAttribute("name"));

				    var checkForSelection = true;
				    var hideDialDifferently = true;

				    if (document.popupNode.hasAttribute("name"))
				    {
					    if (document.popupNode.getAttribute("name") == theApp.render.njClickElementName)
					    {
						    theApp.util.njdebug("noojeeclick", "found element with name=" + theApp.render.njClickElementName);

						    // The user has done a right click on the Noojee
						    // click to dial icon so show
						    // the dial differently menu item.
						    var menuItem = document.getElementById("njcontextDialDifferently");
						    menuItem.hidden = false;
						    // and the dial menu item
						    var menuItem = document.getElementById("njcontextDialSelection");
						    menuItem.hidden = false;

						    // We don't check for 'selected' text if the user
						    // has click on a noojee click icon
						    checkForSelection = false;
						    hideDialDifferently = false;
					    }
				    }

				    if (hideDialDifferently)
				    {
					    // The user has click on something other than a noojee
					    // click icon so
					    // we don't need the dial different option (the standard
					    // dial option lets them dial
					    // differently).
					    var menuItem = document.getElementById("njcontextDialDifferently");
					    menuItem.hidden = true;
					    visibleItems--;
				    }

				    if (checkForSelection)
				    {
					    // Check if the user has selected something that might
					    // contain a number.
					    // if (gContextMenu.isTextSelected )
					    if (theApp.util.getSelectedText())
					    {
						    // The user has selected some text AND it contains a
						    // number
						    theApp.util.njdebug("noojeeclick", "popup - text selected");
						    var menuItem = document.getElementById("njcontextDialSelection");
						    menuItem.hidden = false;
						    menuItem = document.getElementById("njcontextDialAddPattern");
						    menuItem.hidden = false;
					    }
					    else
					    {
						    // either their is no selection or it doesn't
						    // contain a number so suppress both menus.
						    theApp.util.njdebug("noojeeclick", "popup - text not selected");
						    var menuItem = document.getElementById("njcontextDialSelection");
						    menuItem.hidden = true;
						    visibleItems--;
						    menuItem = document.getElementById("njcontextDialAddPattern");
						    menuItem.hidden = true;
						    visibleItems--;
					    }
				    }

				    if (visibleItems == 0)
				    {
					    theApp.util.njdebug("noojeeclick", "removing separator");
					    // all of the menu items have been suppressed so remove
					    // the
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

		    showHangupIcon : function()
		    {
			    theApp.util.njdebug("noojeeclick", "showHangupIcon");
			    if (window.document != null)
			    {
				    var menuIcon = window.document.getElementById("noojeeMenu");
				    menuIcon.hidden = true;

				    var hangupIcon = window.document.getElementById("noojeeHangup");
				    hangupIcon.hidden = false;
			    }
		    },

		    resetIcon : function()
		    {
			    theApp.util.njdebug("noojeeclick", "resetIcon");
			    if (window.document != null)
			    {
				    var menuIcon = window.document.getElementById("noojeeMenu");
				    if (menuIcon != null)
					    menuIcon.hidden = false;
				    else
					    njlog("Error retrieving the Noojee Menu Icon");

				    var hangupIcon = window.document.getElementById("noojeeHangup");
				    if (hangupIcon != null)
					    hangupIcon.hidden = true;
				    else
					    njlog("Error retrieving the Noojee Hangup Icon");
			    }
		    },

		    onDialDifferentlyShowing : function(menu)
		    {
			    theApp.util.njdebug("noojeeclick", "onDialDifferentlyShowing");
			    var menuItem = document.getElementById('njcontextDialDifferently');
			    menuItem.hidden = false;
		    },

		    onDialSelectionShowing : function(menu)
		    {
			    theApp.util.njdebug("noojeeclick", "onDialSelectionShowing called");
			    var selected = theApp.util.getSelectedText();
			    if (selected == null || selected.length == 0)
			    {
				    var menuItem = document.getElementById('njcontextDialSelection');
				    menuItem.hidden = true;
			    }
		    },

		    onDialAddPatternShowing : function(menu)
		    {
			    var selected = theApp.util.getSelectedText();
			    if (selected == null || selected.length == 0)
			    {
				    var menuItem = document.getElementById('njcontextDialAddPattern');
				    menuItem.hidden = true;
			    }
		    },

		    onShowClickIconsShowing : function(menu)
		    {
			    theApp.util.njdebug("noojeeclick", "onShowClickIconsShowing called");
			    var showClickIcons = theApp.prefs.getBoolValue("showClickIcons");
			    var showClickIconsMenu = document.getElementById('menu_ShowClickIcons');
			    showClickIconsMenu.setAttribute("checked", showClickIcons);
		    },

		    onRedialShowing : function(menu)
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
		};

	}
});
