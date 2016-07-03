/**
 * Copyright 2012 Brett Sutton (Adapted for Google Chrome by Sven Werlen)
 * 
 * This file is part of Noojee Click.
 * 
 * Noojee Click is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * Noojee Click is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with Noojee Click. If not, see http://www.gnu.org/licenses/.
 */


var handlers= ( function( window, undefined ) 
{
	var instance = null;
	  
	// revealing module pattern that handles initialization of our new module
	function initializeNewModule() 
	{
		
		// Suppress parent mouse actions.
		function onMouseOver(e)
		{
			// We don't want any parent elements to see this otherwise they
			// might do something unexpected.
			e.stopPropagation();
		
			logging.getInstance().njdebug("handlers", "onMouseOver");
			e.preventDefault();
		}
		
		// Suppress parent mouse actions.
		function onMouseOut (e)
		{
			// We don't want any parent elements to see this otherwise they
			// might do something unexpected.
			e.stopPropagation();
			
			logging.getInstance().njdebug("handlers", "onMouseOut");
			e.preventDefault();
		}
		
		function onDial(e)
		{
			logging.getInstance().njdebug("handlers", "onDial");
			var obj = e.target||e.srcElement;
			var phoneNo = obj.getAttribute("phoneNo");
		
			if (phoneNo === null || phoneNo.length === 0)
				prompts.njAlert("Please enter a phone number.");
			else 
				messagepassing.dial(phoneNo);
			
		
			return true;
		}
		
		/*
		 * Called when the users clicks the 'Hangup' button on the status bar
		 * 
		 */
		function onHangup()
		{
			logging.getInstance().njdebug("handlers", "onHangup");
			asterisk.getInstance().hangup();
			noojeeclick.resetIcon();
		
		}
		
		
		// Just do the simple dial
		function onDialHandler(e)
		{
			logging.getInstance().njdebug("handlers", "onDialHandler");
			try
			{
				if (!e)
					e = window.event;
				if (!util.isRClick(e))
				{
					// We don't want any parent elements to see our click otherwise they
					// might do something unexpected.
					e.stopPropagation();
		
					handlers.onDial(e);
				}
			}
			catch (exp)
			{
				logging.getInstance().njerror(exp);
				util.showException("handlers.onDialHandler", exp);
			}
			e.preventDefault();
		}
		
		
		function onDialDifferently(e)
		{
			logging.getInstance().njdebug("handlers", 'Dial differently');
		
			var obj = e.target||e.srcElement;
			this.doDialDifferently(obj);
		}
		
		
		function dialSelectionMenuAction()
		{
			logging.getInstance().njdebug("handlers", "dialSelectionMenuAction called");
			var phoneNo = util.getSelectedText();
			if (phoneNo === null || phoneNo.length === 0)
			{
				prompts.njAlert("Please select a phone number first");
				return;
			}
		
			var result = prompts.njPrompt("Confirm number to dial.", phoneNo);
			if (result.OK === true && result.value !== null)
			{
				phoneNo = result.value;
				if (phoneNo.length === 0)
					prompts.njAlert("Please enter a phone number.");
				else
					asterisk.getInstance().dial(phoneNo);
			}
		}
		
		function dialFromClipboardMenuAction()
		{
			var phoneNo = util.trim(phonepatterns.extractPhoneNo(util.getClipboardText()));
		
			var result = prompts.njPrompt("Confirm number to dial.", phoneNo);
			if (result.OK === true && result.value !== null)
			{
				phoneNo = result.value;
				if (phoneNo.length === 0)
					prompts.njAlert("Please enter a phone number.");
				else
					asterisk.getInstance().dial(phoneNo);
			}
		}
		
		function dialDifferentlyMenuAction(target)
		{
			target = document.popupNode;
			logging.getInstance().njdebug("handlers", "target=" + target);
		
			// if (target.onImage)
			{
				this.doDialDifferently(target);
			}
			// else
			// njAlert("Dial differently only works on the Noojee Click dial icon");
		}
		
		function doDialDifferently(target)
		{
			var phoneNo = target.getAttribute("phoneNo");
			var result = prompts.njPrompt("Enter number to dial.", phoneNo);
			if (result.OK === true && result.value !== null)
			{
				phoneNo = result.value;
				if (phoneNo.length === 0)
					prompts.njAlert("Please enter a phone number.");
				else
					asterisk.getInstance().dial(phoneNo);
			}
		}
		
		function dialMenuAction()
		{
			var phoneNo = "";
			var result = prompts.njPrompt("Enter number to dial.", phoneNo);
			if (result.OK === true && result.value !== null)
			{
				phoneNo = result.value;
				if (phoneNo.length === 0)
					prompts.njAlert("Please enter a phone number.");
				else
					asterisk.getInstance().dial(phoneNo);
			}
		}
		
		function redialMenuAction()
		{
			logging.getInstance().njdebug("handlers", "redialMenuAction called");
			var phoneNo = optionsAccessor.getInstance().getValue("lastDialed");
			if (phoneNo !== null && phoneNo.length > 0)
			{
				asterisk.getInstance().dial(phoneNo);
			}
			else
				prompts.njAlert("Redial string is empty."); // this shouldn't happen.
		}
		
		function onAddDialPatternMenuAction()
		{
			var fault = false;
			var phoneNo = util.getRawSelectedText();
			if (phoneNo === null || util.trim(phoneNo).length === 0)
			{
				prompts.njAlert("Please select a phone number first");
				return;
			}
		
			// transpose the phone number into a pattern
			phoneNo = util.trim(phoneNo);
			var newPattern = "";
			var delimiters = optionsAccessor.getInstance().getValue("delimiters");
			for ( var i = 0; i < phoneNo.length && fault === false; i++)
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
						case ' ':
							newPattern += ' ';
							break;
						default:
							prompts.njAlert("Unsupported character '" + phoneNo[i] + "' found in phone number. Add the character to the 'Delimiters' field on 'Advanced' tab in the Noojee Click configuration and try again.");
							fault = true;
							break;
		
					}
				}
			}
		
			if (!fault)
			{
				var result = prompts.njPrompt("Add pattern for " + phoneNo + "?", newPattern);
				if (result.OK === true && result.value !== null)
				{
					newPattern  = result.value;
		
					if (newPattern.length !== 0)
					{
						var patternList = optionsAccessor.getInstance().getValue("pattern");
						patternList += "\n" + newPattern;
						optionsAccessor.getInstance().setValue("pattern", patternList);
						render.onRefresh();
					}
				}
			}
		}
		
		function onShowClickIcons()
		{
			var enabled = optionsAccessor.getInstance().getBoolValue("showClickIcons");
			enabled = !enabled;
			optionsAccessor.getInstance().setBoolValue("showClickIcons", enabled);
			render.onRefresh();
			if (enabled === true)
				asterisk.getInstance().init();
		}
		
		
		
		return {
			onMouseOver: onMouseOver,
			onMouseOut : onMouseOut,
			onDial : onDial,
			onHangup:onHangup,
			onDialHandler : onDialHandler,
			onDialDifferently : onDialDifferently,
			dialSelectionMenuAction: dialSelectionMenuAction,
			dialFromClipboardMenuAction : dialFromClipboardMenuAction,
			dialDifferentlyMenuAction : dialDifferentlyMenuAction,
			onAddDialPatternMenuAction : setValue,
			doDialDifferently : doDialDifferently,
			redialMenuAction : redialMenuAction,
			onAddDialPatternMenuAction : onAddDialPatternMenuAction,
			onShowClickIcons : onShowClickIcons
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
