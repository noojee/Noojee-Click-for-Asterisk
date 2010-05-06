
noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.handlers =
{


// Display tooltip
onMouseOver: function (e)
{
	theApp.util.njdebug("handlers", "onMouseOver");
},

// Display tooltip
onMouseOut: function (e)
{
	theApp.util.njdebug("handlers", "onMouseOut");
},

onDial: function (e)
{
	theApp.util.njlog("handlers", "onDial");
	var obj = theApp.noojeeclick.ns6 ? e.target : event.srcElement;
	var phoneNo = obj.getAttribute("phoneNo");

	if (phoneNo == null || phoneNo.length == 0)
		theApp.util.njAlert("Please enter a phone number.");
	else
		theApp.asterisk.getInstance().dial(phoneNo);

	return true;
},

/*
* Called when the users clicks the 'Hangup' button on the status bar
* 
*/
onHangup: function ()
{
	theApp.util.njlog("onHangup");
	theApp.asterisk.getInstance().hangup();
	theApp.noojeeclick.resetIcon();

},


// Just do the simple dial
onDialHandler: function (e)
{
	theApp.util.njdebug("handlers", "onDialHandler");
	try
	{
		theApp.util.njdebug("onDialHandler");

		if (!e)
			e = window.event;
		if (!theApp.util.isRClick(e))
		{
			theApp.handlers.onDial(e);
		}
	}
	catch (e)
	{
		theApp.util.njlog(e);
		theApp.util.showException("onDialHandler", e);
	}
},


onDialDifferently: function (e)
{
	theApp.util.njlog("handlers", 'Dial differently');

	var obj = ns6 ? e.target : event.srcElement;
	this.doDialDifferently(obj);
},


dialSelectionMenuAction: function ()
{
	theApp.util.njdebug("handlers", "dialSelectionMenuAction called");
	var phoneNo = getSelectedText();
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

dialFromClipboardMenuAction: function ()
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
},

dialDifferentlyMenuAction: function (target)
{
	target = document.popupNode;
	theApp.util.njdebug("handlers", "target=" + target);

	// if (target.onImage)
	{
		this.doDialDifferently(target);
	}
	// else
	// njAlert("Dial differently only works on the Noojee Click dial icon");
},

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

dialMenuAction: function ()
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
},

redialMenuAction: function ()
{
	theApp.util.njdebug("handlers", "redialMenuAction called");
	var phoneNo = theApp.prefs.getValue("lastDialed");
	if (phoneNo != null && phoneNo.length > 0)
	{
		theApp.asterisk.getInstance().dial(phoneNo);
	}
	else
		theApp.prompts.njAlert("Redial string is empty."); // this shouldn't happen.
},

onAddDialPatternMenuAction: function ()
{
	var fault = false;
	var phoneNo = theApp.util.getRawSelectedText();
	if (phoneNo == null || theApp.util.trim(phoneNo).length == 0)
	{
		theApp.promptsnjAlert("Please select a phone number first");
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
				case '.':
					newPattern += '.';
					break;
				case ' ':
					newPattern += ' ';
					break;
				default:
					theApp.prompts.njAlert("Unsupported character found in phone number: '" + phoneNo[i] + "'");
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

onEnable: function ()
{
	var enabled = theApp.prefs.getBoolValue("enabled");
	enabled = !enabled;
	theApp.prefs.setBoolValue("enabled", enabled);
	theApp.render.onRefresh();
	if (enabled == true)
		theApp.asterisk.getInstance().init();
},




}

}});