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

theApp.handlersMenu =
{


dialFromClipboardMenuAction: function ()
{
	if (!theApp.asterisk.isConfigured())
		theApp.prompts.njAlert("You must configure the Extension and Asterisk setting before you can dial.");
	else
	{
		var phoneNo = theApp.util.trim(theApp.phonepatterns.extractPhoneNo(theApp.util.getClipboardText()));
	
		var result = theApp.prompts.njPrompt("Confirm number to dial.", phoneNo);
		if (result.OK == true && result.value != null)
		{
			phoneNo = result.value;
			if (phoneNo.length == 0)
				theApp.prompts.njAlert("Please enter a phone number.");
			else
				theApp.asterisk.getInstance().dial(phoneNo);
		}
	}
},


dialMenuAction: function ()
{
	if (!theApp.asterisk.isConfigured())
		theApp.prompts.njAlert("You must configure the Extension and Asterisk setting before you can dial.");
	else
	{
		var phoneNo = "";
		var result = theApp.prompts.njPrompt("Enter number to dial.", phoneNo);
		if (result.OK == true && result.value != null)
		{
			phoneNo = result.value;
			if (phoneNo.length == 0)
				theApp.prompts.njAlert("Please enter a phone number.");
			else
				theApp.asterisk.getInstance().dial(phoneNo);
		}
	}
},

redialMenuAction: function ()
{
	theApp.logging.njdebug("handlersMenu", "redialMenuAction called");
	if (!theApp.asterisk.isConfigured())
		theApp.prompts.njAlert("You must configure the Extension and Asterisk setting before you can dial.");
	else
	{
		var phoneNo = theApp.prefs.getValue("lastDialed");
		if (phoneNo != null && phoneNo.length > 0)
		{
			theApp.asterisk.getInstance().dial(phoneNo);
		}
		else
			theApp.prompts.njAlert("Redial string is empty."); // this shouldn't happen.
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




};

}});