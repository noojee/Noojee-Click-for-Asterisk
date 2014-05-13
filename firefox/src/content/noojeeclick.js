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

noojeeClick.ns(function()
{
	with (noojeeClick.LIB)
	{

		theApp.noojeeclick =
		{

		    autoAnswerList : [
		    {
		        manufacturer : "Aastra",
		        header : "Call-Info: Answer-After=0"
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
		        manufacturer : "Snom - post firmware v8.7",
		        header : "Alert-Info:http://www.ignored.com\\;info=alert-autoanswer\\;delay=0"
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

			    theApp.logging.njdebug("noojeeclick", "onPageLoad called");
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
						    theApp.logging.njerror("Loading of Styles failed so init terminated");
				    }
			    }
			    catch (e)
			    {
				    theApp.logging.njerror(e);
				    theApp.util.showException("noojeeclick.onPageLoad", e);
			    }
		    },

		    onDialDifferently : function(e)
		    {
			    theApp.logging.njlog('Dial differently');

			    var obj = e.target||e.srcElement;
			    this.doDialDifferently(obj);
		    },

		    onDial : function(e)
		    {
			    theApp.logging.njlog("onDial");
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
			    theApp.logging.njlog("onAnswer");
			    theApp.asterisk.getInstance().answer();

			    return true;
		    },

		    showMenuHideItems : function(event)
		    {
			    var visibleItems = 3;
			    try
			    {
				    theApp.logging.njdebug("noojeeclick", "showMenuHideItems event=" + event);
				    theApp.logging.njdebug("noojeeclick", "document.popupNode=" + document.popupNode);

				    theApp.logging.njdebug("noojeeclick", "popupNode name=" + document.popupNode.hasAttribute("name"));

				    var checkForSelection = true;
				    var hideDialDifferently = true;

				    if (document.popupNode.hasAttribute("name"))
				    {
					    if (document.popupNode.getAttribute("name") == theApp.render.njClickElementName)
					    {
						    theApp.logging.njdebug("noojeeclick", "found element with name=" + theApp.render.njClickElementName);

						    // The user has done a right click on the Noojee
						    // click to dial icon so show
						    // the dial differently menu item.
						    var menuItem = document.getElementById("noojeeClick.njcontextDialDifferently");
						    menuItem.hidden = false;
						    // and the dial menu item
						    var menuItem = document.getElementById("noojeeClick.contextDialSelection");
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
					    var menuItem = document.getElementById("noojeeClick.njcontextDialDifferently");
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
						    theApp.logging.njdebug("noojeeclick", "popup - text selected");
						    var menuItem = document.getElementById("noojeeClick.contextDialSelection");
						    menuItem.hidden = false;
						    menuItem = document.getElementById("noojeeClick.contextDialAddPattern");
						    menuItem.hidden = false;
					    }
					    else
					    {
						    // either their is no selection or it doesn't
						    // contain a number so suppress both menus.
						    theApp.logging.njdebug("noojeeclick", "popup - text not selected");
						    var menuItem = document.getElementById("noojeeClick.contextDialSelection");
						    menuItem.hidden = true;
						    visibleItems--;
						    menuItem = document.getElementById("noojeeClick.contextDialAddPattern");
						    menuItem.hidden = true;
						    visibleItems--;
					    }
				    }

				    if (visibleItems == 0)
				    {
					    theApp.logging.njdebug("noojeeclick", "removing separator");
					    // all of the menu items have been suppressed so remove
					    // the
					    // separator.
					    var menuItem = document.getElementById("noojeeClick.contextSeparator");
					    menuItem.hidden = true;
				    }
			    }
			    catch (e)
			    {
			    	theApp.logging.njerror(e);
				    theApp.util.showException("noojeeclick.showMenuHideItems", e);
			    }

		    },

		    showHangupIcon : function()
		    {
			    theApp.logging.njdebug("noojeeclick", "showHangupIcon");
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
			    theApp.logging.njdebug("noojeeclick", "resetIcon");
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
			    theApp.logging.njdebug("noojeeclick", "onDialDifferentlyShowing");
			    var menuItem = document.getElementById('noojeeClick.njcontextDialDifferently');
			    menuItem.hidden = false;
		    },

		    onDialSelectionShowing : function(menu)
		    {
			    theApp.logging.njdebug("noojeeclick", "onDialSelectionShowing called");
			    var selected = theApp.util.getSelectedText();
			    if (selected == null || selected.length == 0)
			    {
				    var menuItem = document.getElementById('noojeeClick.contextDialSelection');
				    menuItem.hidden = true;
			    }
		    },

		    onDialAddPatternShowing : function(menu)
		    {
			    var selected = theApp.util.getSelectedText();
			    if (selected == null || selected.length == 0)
			    {
				    var menuItem = document.getElementById('noojeeClick.contextDialAddPattern');
				    menuItem.hidden = true;
			    }

		    },

		    
		    onMenuOpen : function(menu)
		    {
		    	noojeeClick.noojeeclick.onShowClickIconsShowing(this);
		    	noojeeClick.noojeeclick.onRedialShowing(this);
		    	noojeeClick.noojeeclick.onClidQuickPickShowing(this);
		    },
		    
		    onShowClickIconsShowing : function(menu)
		    {
			    theApp.logging.njdebug("noojeeclick", "onShowClickIconsShowing called");
			    var showClickIcons = theApp.prefs.getBoolValue("showClickIcons");
			    var showClickIconsMenu = document.getElementById('noojeeClick.menu_ShowClickIcons');
			    showClickIconsMenu.setAttribute("checked", showClickIcons);
		    },

		    
		    onRedialShowing : function(menu)
		    {
			    theApp.logging.njdebug("noojeeclick", "onRedialShowing called");
			    var lastDialed = theApp.prefs.getValue("lastDialed");
			    var redialMenu = document.getElementById('noojeeClick.menu_Redial');
			    if (lastDialed != null && lastDialed.length > 0)
			    {
				    redialMenu.label = "Redial: " + lastDialed;
				    redialMenu.hidden = false;
			    }
			    else
				    redialMenu.hidden = true;
		    },
		    
		    onSelectClidQuickPick : function (menuItem)
		    {
		    	try
		    	{
		    		theApp.logging.njdebug("quickpicks", "MenuItem=" + menuItem + " id=" + menuItem.id);
		    		
		    		var clidIndex = menuItem.getAttribute("clid-index");
		    		
			    	theApp.logging.njdebug("quickpicks", "User selected menu clidIndex=" + clidIndex);
			    	
	    			var name = theApp.prefs.getValue("clidquickpick.pick-" + clidIndex + "-name");
	    			
	    			theApp.logging.njdebug("quickpicks", "setting active clid to: " + name);
	    			theApp.prefs.setValue("clidquickpick.active", clidIndex);
	    			
	    			// Show a tick next to the active clid.
			    	menuItem.setAttribute("checked", true);
		    	}
		    	catch (e)
		    	{
		    		theApp.prompts.njAlert(e);
		    	}
		    },

		    renderQuickPickMenu : function ()
		    {
		    	// Clear the existing menu items.
		    	var element = document.getElementById("noojeeClick.menu_ClidQuickPick");
		    	if (element != null)
		    		element.parentNode.removeChild(element);

		    	// Create the new popup menu
	    		var listMenu = document.createElement("menu");
	    		listMenu.setAttribute("label","Switch CLID");
	    		listMenu.setAttribute("id", "noojeeClick.menu_ClidQuickPick");

	    		var menuDial = document.getElementById('noojeeClick.menuDial');
	    		theApp.logging.njdebug("quickpicks", "retrieved menu: " + menuDial);
	    		menuDial.appendChild(listMenu);

//	    		// Reset the quick pick list menu
//	    		while (menuDial.hasChildNodes()) 
//	    		{
//	    			menuDial.removeChild(menuDial.lastChild);
//	    		}
	    		
	    		// Get the active menu item.
	    		var activeQuickPick = theApp.prefs.getValue("clidquickpick.active");
	    		theApp.logging.njdebug("quickpicks", "active quickpick: " + activeQuickPick);
	    		
	    		// get the no. of quick picks.
	    		var count = theApp.prefs.getValue("clidquickpick.count");
	    		for (var i = 0; i < count; i++)
	    		{
	    			var name = theApp.prefs.getValue("clidquickpick.pick-" + i + "-name");
	    			var clid = theApp.prefs.getValue("clidquickpick.pick-" + i + "-clid");
	    			
	    			
	    			theApp.logging.njdebug("quickpicks", "retrieved quickpick: " + name + ", " + clid);

	    			// Create the clid menu item.
	    			var item = listMenu.appendItem(name);
	    			item.id = "noojeeClick.menu_ClidQuickPick.clid-index-" + i;
	    			item.setAttribute("id", "noojeeClick.menu_ClidQuickPick.clid-index-" + i);
	    			item.setAttribute("clid-index", i);
	    			item.setAttribute("type", "radio");
	    			item.setAttribute("oncommand", "noojeeClick.noojeeclick.onSelectClidQuickPick(this);");

	    			// If there is currently no active quick pick then set the first one as active.
	    			if (i == 0 && activeQuickPick == "")
	    			{
	    				theApp.logging.njdebug("quickpicks", "setting active quickpick to:" + i);
	    				theApp.prefs.setValue("clidquickpick.active", i);
	    			}
	    				
	    			// add the quick pick to the menu.
	    			//var item = window.document.createElement("menuitem"); 
	    			//noojeeClick.menu_ClidQuickPick_List_" + name);
	    			//item.addEventListener("onClick", function() {noojeeClick.noojeeclick.onSelectClidQuickPick()}, false);
	    			if (i == activeQuickPick)
	    			{
	    				theApp.logging.njdebug("quickpicks", "set active quickpick: " + i);
	    				theApp.prefs.setValue("clidquickpick.active", i);
	    				item.setAttribute("checked", "true");
	    			}
	    		}
		    },
		    
		    onClidQuickPickShowing : function(menu)
		    {
		    	try
		    	{

				    theApp.logging.njdebug("quickpicks", "onQuickPickShowing called");
				    var enabled = theApp.prefs.getBoolValue("clidquickpick.enabled");
				    theApp.logging.njdebug("quickpicks", "quickPickMenu:  enabled: " + enabled);
				    if (enabled)
				    {
				    	var reset = theApp.prefs.getBoolValue("clidquickpick.reset");
				    	var quickPickMenu = document.getElementById('noojeeClick.menu_ClidQuickPick');
				    	if (quickPickMenu == null || reset == true)
				    	{
							// Flag that the menu has been reset.
							theApp.prefs.setBoolValue("clidquickpick.reset", false);
				    		noojeeClick.noojeeclick.renderQuickPickMenu();
				    	}

				    	if (quickPickMenu != null)
				    		quickPickMenu.hidden = false;
				    }
				    else
				    {
				    	var quickPickMenu = document.getElementById('noojeeClick.menu_ClidQuickPick');
				    	if (quickPickMenu != null)
				    		quickPickMenu.hidden = true;
				    }
		    	}
		    	catch (e)
		    	{
		    		theApp.prompts.njAlert(e);
		    	}
		    }
		};

	}
});
