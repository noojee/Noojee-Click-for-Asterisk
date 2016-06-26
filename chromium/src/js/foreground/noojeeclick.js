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


var noojeeclick = ( function( window, undefined ) 
{
	var instance = null;
	  
	// revealing module pattern that handles initialization of our new module
	function initializeNewModule() 
	{
		
		var autoAnswerList = [
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
		} ];
		
		
		
		/*
		 * Called when a page finishes loading This is hooked by the
		 * namespace.initialise()
		 */
		function onPageLoad(e)
		{
		    logging.getInstance().njdebug("noojeeclick", "onPageLoad called");
		    try
		    {
		
			    //if (optionsAccessor.getInstance().getBoolValue("showClickIcons") == true)
			    {
				    if (util.hasGlobalStyle(document) === true) return;
		
				    // Not actually used except as a flag to tell us we have
				    // already initialized the
				    // page.
				    var css = ".NoojeeClickInstalled { }";
		
				    // If we can't add the global styles then we have a
				    // major problem
				    if (util.addGlobalStyle(document, css))
				    {
					    //new monitor.Monitor().init(document);
		
					    render.addClickToDialLinks(document);
				    }
				    else
					    logging.getInstance().njerror("Loading of Styles failed so init terminated");
			    }
		    }
		    catch (exp)
		    {
			    logging.getInstance().njerror(exp);
			    util.showException("noojeeclick.onPageLoad", exp);
		    }
		}
		
		function onDialDifferently(e)
		{
				alert('onDialDifferently');
		// 			    logging.getInstance().njlog('Dial differently');
		// 
		// 			    var obj = e.target||e.srcElement;
		// 			    this.doDialDifferently(obj);
		}
		
		function onDial(e)
		{
			 alert('onDial');
		// 			    logging.getInstance().njlog("onDial");
		// 			    var obj = e.target||e.srcElement;
		// 			    var phoneNo = obj.getAttribute("phoneNo");
		// 
		// 			    if (phoneNo == null || phoneNo.length == 0)
		// 				    prompts.njAlert("Please enter a phone number.");
		// 			    else
		// 				    asterisk.getInstance().dial(phoneNo);
		
		    return true;
		}
		
		function onAnswer(e)
		{
			  alert('onAnswer');
		// 			    logging.getInstance().njlog("onAnswer");
		// 			    asterisk.getInstance().answer();
		
		    return true;
		},
		
		function showMenuHideItems(event)
		{
			  alert('showMenuHideItems');
		// 			    var visibleItems = 3;
		// 			    try
		// 			    {
		// 				    logging.getInstance().njdebug("noojeeclick", "showMenuHideItems event=" + event);
		// 				    logging.getInstance().njdebug("noojeeclick", "document.popupNode=" + document.popupNode);
		// 
		// 				    logging.getInstance().njdebug("noojeeclick", "popupNode name=" + document.popupNode.hasAttribute("name"));
		// 
		// 				    var checkForSelection = true;
		// 				    var hideDialDifferently = true;
		// 
		// 				    if (document.popupNode.hasAttribute("name"))
		// 				    {
		// 					    if (document.popupNode.getAttribute("name") == render.njClickElementName)
		// 					    {
		// 						    logging.getInstance().njdebug("noojeeclick", "found element with name=" + render.njClickElementName);
		// 
		// 						    // The user has done a right click on the Noojee
		// 						    // click to dial icon so show
		// 						    // the dial differently menu item.
		// 						    var menuItem = document.getElementById("njcontextDialDifferently");
		// 						    menuItem.hidden = false;
		// 						    // and the dial menu item
		// 						    var menuItem = document.getElementById("njcontextDialSelection");
		// 						    menuItem.hidden = false;
		// 
		// 						    // We don't check for 'selected' text if the user
		// 						    // has click on a noojee click icon
		// 						    checkForSelection = false;
		// 						    hideDialDifferently = false;
		// 					    }
		// 				    }
		// 
		// 				    if (hideDialDifferently)
		// 				    {
		// 					    // The user has click on something other than a noojee
		// 					    // click icon so
		// 					    // we don't need the dial different option (the standard
		// 					    // dial option lets them dial
		// 					    // differently).
		// 					    var menuItem = document.getElementById("njcontextDialDifferently");
		// 					    menuItem.hidden = true;
		// 					    visibleItems--;
		// 				    }
		// 
		// 				    if (checkForSelection)
		// 				    {
		// 					    // Check if the user has selected something that might
		// 					    // contain a number.
		// 					    // if (gContextMenu.isTextSelected )
		// 					    if (util.getSelectedText())
		// 					    {
		// 						    // The user has selected some text AND it contains a
		// 						    // number
		// 						    logging.getInstance().njdebug("noojeeclick", "popup - text selected");
		// 						    var menuItem = document.getElementById("njcontextDialSelection");
		// 						    menuItem.hidden = false;
		// 						    menuItem = document.getElementById("njcontextDialAddPattern");
		// 						    menuItem.hidden = false;
		// 					    }
		// 					    else
		// 					    {
		// 						    // either their is no selection or it doesn't
		// 						    // contain a number so suppress both menus.
		// 						    logging.getInstance().njdebug("noojeeclick", "popup - text not selected");
		// 						    var menuItem = document.getElementById("njcontextDialSelection");
		// 						    menuItem.hidden = true;
		// 						    visibleItems--;
		// 						    menuItem = document.getElementById("njcontextDialAddPattern");
		// 						    menuItem.hidden = true;
		// 						    visibleItems--;
		// 					    }
		// 				    }
		// 
		// 				    if (visibleItems == 0)
		// 				    {
		// 					    logging.getInstance().njdebug("noojeeclick", "removing separator");
		// 					    // all of the menu items have been suppressed so remove
		// 					    // the
		// 					    // separator.
		// 					    var menuItem = document.getElementById("njcontextSeparator");
		// 					    menuItem.hidden = true;
		// 				    }
		// 			    }
		// 			    catch (e)
		// 			    {
		// 				    util.showException("showMenuHideItems", e);
		// 				    prompts.njAlert(e);
		// 			    }
		
		}
		
		function showHangupIcon()
		{
			 
			 alert('showHangupIcon');
		// 			    logging.getInstance().njdebug("noojeeclick", "showHangupIcon");
		// 			    if (window.document != null)
		// 			    {
		// 				    var menuIcon = window.document.getElementById("noojeeMenu");
		// 				    menuIcon.hidden = true;
		// 
		// 				    var hangupIcon = window.document.getElementById("noojeeHangup");
		// 				    hangupIcon.hidden = false;
		// 			    }
		}
		
		function resetIcon()
		{
			 logging.getInstance().njdebug("noojeeclick", "resetIcon");
			 chrome.browserAction.setBadgeText({text:""});
		}
		
		function onDialDifferentlyShowing(menu)
		{
			 alert('onDialDifferentlyShowing');
		// 			    logging.getInstance().njdebug("noojeeclick", "onDialDifferentlyShowing");
		// 			    var menuItem = document.getElementById('njcontextDialDifferently');
		// 			    menuItem.hidden = false;
		}
		
		function onDialSelectionShowing(menu)
		{
			 alert('onDialSelectionShowing');
		// 			    logging.getInstance().njdebug("noojeeclick", "onDialSelectionShowing called");
		// 			    var selected = util.getSelectedText();
		// 			    if (selected == null || selected.length == 0)
		// 			    {
		// 				    var menuItem = document.getElementById('njcontextDialSelection');
		// 				    menuItem.hidden = true;
		// 	    }
		}
		
		function onDialAddPatternShowing(menu)
		{
			 alert('onDialAddPatternShowing');
		// 			    var selected = util.getSelectedText();
		// 			    if (selected == null || selected.length == 0)
		// 			    {
		// 				    var menuItem = document.getElementById('njcontextDialAddPattern');
		// 				    menuItem.hidden = true;
		// 			    }
		}
		
		function onShowClickIconsShowing(menu)
		{
			 alert('onShowClickIconsShowing');
		// 			    logging.getInstance().njdebug("noojeeclick", "onShowClickIconsShowing called");
		// 			    var showClickIcons = optionsAccessor.getInstance().getBoolValue("showClickIcons");
		// 			    var showClickIconsMenu = document.getElementById('menu_ShowClickIcons');
		// 			    showClickIconsMenu.setAttribute("checked", showClickIcons);
		},
		
		function onRedialShowing(menu)
		{
			 alert('onRedialShowing');
		// 			    logging.getInstance().njdebug("noojeeclick", "onRedialShowing called");
		// 			    var lastDialed = optionsAccessor.getInstance().getValue("lastDialed");
		// 			    var redialMenu = document.getElementById('menu_Redial');
		// 			    if (lastDialed != null && lastDialed.length > 0)
		// 			    {
		// 				    redialMenu.label = "Redial: " + lastDialed;
		// 				    redialMenu.hidden = false;
		// 			    }
		// 			    else
		// 				    redialMenu.hidden = true;
		}
		
		return 
		{
			onPageLoad : onPageLoad,
			onDialDifferently : onDialDifferently,
			onDial : onDial,
			onAnswer : onAnswer.
			showMenuHideItems : showMenuHideItems,
			showHangupIcon : showHangupIcon,
			resetIcon : resetIcon,
			onDialDifferentlyShowing : onDialDifferentlyShowing,
			onDialSelectionShowing : onDialSelectionShowing,
			onDialAddPatternShowing : onDialAddPatternShowing,
			onShowClickIconsShowing : onShowClickIconsShowing,
			onRedialShowing : onRedialShowing
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
