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

/**
 * Handles actions from the 'content' page as opposed to handling actions from the NJ click menu which are handled by handlersMenu.js
 */
theApp.handlersContent =
{


// Suppress parent mouse actions.
onMouseOver: function (e)
{
	// We don't want any parent elements to see this otherwise they
	// might do something unexpected.
	e.stopPropagation();

	theApp.logging.njdebug("handlersContent", "onMouseOver");
	e.preventDefault();
},

//Suppress parent mouse actions.
onMouseOut: function (e)
{
	// We don't want any parent elements to see this otherwise they
	// might do something unexpected.
	e.stopPropagation();
	
	theApp.logging.njdebug("handlersContent", "onMouseOut");
	e.preventDefault();
},

onDial: function (e)
{
	theApp.logging.njdebug("handlersContent", "onDial");
	var obj = e.target||e.srcElement;
	var phoneNo = obj.getAttribute("phoneNo");

	if (phoneNo == null || phoneNo.length == 0)
		theApp.prompts.njAlert("Please enter a phone number.");
	else 
		theApp.messagepassing.dial(phoneNo);
	

	return true;
},

/*
* Called when the users clicks the 'Hangup' button on the status bar
* 
*/
onHangup: function ()
{
	theApp.logging.njdebug("handlersContent", "onHangup");
	theApp.messagepassing.hangup();
	theApp.noojeeclick.resetIcon();

},


// Just do the simple dial
onDialHandler: function (e)
{
	theApp.logging.njdebug("handlersContent", "onDialHandler");
	try
	{
		if (!e)
			e = window.event;
		if (!theApp.util.isRClick(e))
		{
			// We don't want any parent elements to see our click otherwise they
			// might do something unexpected.
			e.stopPropagation();

			theApp.handlersContent.onDial(e);
		}
	}
	catch (e)
	{
		theApp.logging.njerror(e);
		theApp.util.showException("handlersContent.onDialHandler", e);
	}
	e.preventDefault();
},


onDialDifferently: function (e)
{
	theApp.logging.njdebug("handlersContent", 'Dial differently');

	var obj = e.target||e.srcElement;
	this.doDialDifferently(obj);
},


/**
 * User has selected text (we hope) and used the context menu to dial the selected text.
 */
dialSelectionMenuAction: function ()
{
	theApp.logging.njdebug("handlersContent", "dialSelectionMenuAction called");
	var phoneNo = theApp.util.getSelectedText();
	if (phoneNo == null || phoneNo.length == 0)
	{
		theApp.prompts.njAlert("Please select a phone number first");
		return;
	}

	var result = theApp.prompts.njPrompt("Confirm number to dial.", phoneNo);
	if (result.OK == true && result.value != null)
	{
		phoneNo = result.value;
		if (phoneNo.length == 0)
			theApp.prompts.njAlert("Please enter a phone number.");
		else
			theApp.asterisk.getInstance().dial(phoneNo);
	}
},

/**
 * User has right click the nj dial icon and seleted the 'dial differently' menu option.
 */
dialDifferentlyMenuAction: function (target)
{
	target = document.popupNode;
	theApp.logging.njdebug("handlersContent", "target=" + target);

	// if (target.onImage)
	{
		this.doDialDifferently(target);
	}
	// else
	// njAlert("Dial differently only works on the Noojee Click dial icon");
},

/**
 * Does the work for dialDifferentlyMenuAction
 */
doDialDifferently: function (target)
{
	var phoneNo = target.getAttribute("phoneNo");
	var result = theApp.prompts.njPrompt("Enter number to dial.", phoneNo);
	if (result.OK == true && result.value != null)
	{
		phoneNo = result.value;
		if (phoneNo.length == 0)
			theApp.prompts.njAlert("Please enter a phone number.");
		else
			theApp.asterisk.getInstance().dial(phoneNo);
	}
},

onShowClickIcons: function ()
{
	var enabled = theApp.prefs.getBoolValue("showClickIcons");
	enabled = !enabled;
	theApp.prefs.setBoolValue("showClickIcons", enabled);
	theApp.render.onRefresh();
	if (enabled == true)
		theApp.asterisk.getInstance().init();
},

/**
 * Users has selected text (we hope) and wants to use that text to create and add
 * a dial pattern.
 */
onAddDialPatternMenuAction: function ()
{
	var fault = false;
	var phoneNo = theApp.util.getRawSelectedText();
	if (phoneNo == null || theApp.util.trim(phoneNo).length == 0)
	{
		theApp.prompts.njAlert("Please select a phone number first");
		return;
	}

	// transpose the phone number into a pattern
	phoneNo = theApp.util.trim(phoneNo);
	var newPattern = "";
	var delimiters = theApp.prefs.getValue("delimiters");
	for ( var i = 0; i < phoneNo.length && fault == false; i++)
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
					theApp.prompts.njAlert("Unsupported character '" + phoneNo[i] + "' found in phone number. Add the character to the 'Delimiters' field on 'Advanced' tab in the Noojee Click configuration and try again.");
					fault = true;
					break;

			}
		}
	}

	if (!fault)
	{
		var result = theApp.prompts.njPrompt("Add pattern for " + phoneNo + "?", newPattern);
		if (result.OK == true && result.value != null)
		{
			newPattern  = result.value;

			if (newPattern.length != 0)
			{
				var patternList = theApp.prefs.getValue("pattern");
				patternList += "\n" + newPattern;
				theApp.prefs.setValue("pattern", patternList);
				theApp.render.onRefresh();
			}
		}
	}
},




};

}});