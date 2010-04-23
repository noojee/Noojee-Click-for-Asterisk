// Display tooltip
function onMouseOver(e)
{
	njdebug("handlers", "onMouseOver");
}

// Display tooltip
function onMouseOut(e)
{
	njdebug("handlers", "onMouseOut");
}

// Just do the simple dial
function onDialHandler(e)
{
	njdebug("handlers", "onDialHandler");
	try
	{
		njdebug("onDialHandler");

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
		showException("onDialHandler", e);
	}
}


function onDialDifferently(e)
{
	njlog("handlers", 'Dial differently');

	var obj = ns6 ? e.target : event.srcElement;
	doDialDifferently(obj);
}

function onDial(e)
{
	njlog("handlers", "onDial");
	var obj = ns6 ? e.target : event.srcElement;
	var phoneNo = obj.getAttribute("phoneNo");

	if (phoneNo == null || phoneNo.length == 0)
		njAlert("Please enter a phone number.");
	else
		gAsterisk.dial(phoneNo);

	return true;
}

function dialSelectionMenuAction()
{
	njdebug("handlers", "dialSelectionMenuAction called");
	var phoneNo = getSelectedText();
	if (phoneNo == null || phoneNo.length == 0)
	{
		njAlert("Please select a phone number first");
		return;
	}

	var result = njPrompt("Confirm number to dial.", phoneNo);
	if (result.OK == true && result.value != null)
	{
		phoneNo = result.value;
		if (phoneNo.length == 0)
			njAlert("Please enter a phone number.");
		else
			gAsterisk.dial(phoneNo);
	}
}

function dialFromClipboardMenuAction()
{
	var phoneNo = getClipboardText();

	var result = njPrompt("Confirm number to dial.", phoneNo);
	if (result.OK == true && result.value != null)
	{
		phoneNo = result.value;
		if (phoneNo.length == 0)
			njAlert("Please enter a phone number.");
		else
			gAsterisk.dial(phoneNo);
	}
}

function dialDifferentlyMenuAction(target)
{
	target = document.popupNode;
	njdebug("handlers", "target=" + target);

	// if (target.onImage)
	{
		doDialDifferently(target);
	}
	// else
	// njAlert("Dial differently only works on the Noojee Click dial icon");
}

function doDialDifferently(target)
{
	var phoneNo = target.getAttribute("phoneNo");
	var result = njPrompt("Enter number to dial.", phoneNo);
	if (result.OK == true && result.value != null)
	{
		phoneNo = result.value;
		if (phoneNo.length == 0)
			njAlert("Please enter a phone number.");
		else
			gAsterisk.dial(phoneNo);
	}
}

function dialMenuAction()
{
	var phoneNo = "";
	var result = njPrompt("Enter number to dial.", phoneNo);
	if (result.OK == true && result.value != null)
	{
		phoneNo = result.value;
		if (phoneNo.length == 0)
			njAlert("Please enter a phone number.");
		else
			gAsterisk.dial(phoneNo);
	}
}

function redialMenuAction()
{
	njdebug("handlers", "redialMenuAction called");
	var phoneNo = getValue("lastDialed");
	if (phoneNo != null && phoneNo.length > 0)
	{
		gAsterisk.dial(phoneNo);
	}
	else
		njAlert("Redial string is empty."); // this shouldn't happen.
}

function onAddDialPatternMenuAction()
{
	var fault = false;
	var phoneNo = getRawSelectedText();
	if (phoneNo == null || trim(phoneNo).length == 0)
	{
		njAlert("Please select a phone number first");
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
					njAlert("Unsupported character found in phone number: '" + phoneNo[i] + "'");
					fault = true;
					break;

			}
		}
	}

	if (!fault)
	{
		var result = njPrompt("Add pattern for " + phoneNo + "?", newPattern);
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
