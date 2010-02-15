var EXPORTED_SYMBOLS = ["normalisePhoneNo", "transposePattern"];


Components.utils.import("resource://noojeeclick/prompts.jsm");
Components.utils.import("resource://noojeeclick/util.jsm");
Components.utils.import("resource://noojeeclick/prefs.jsm");

/*
 * normalisePhoneNo non-numeric characters from the phone number ready to use in
 * dial string
 */
function normalisePhoneNo(phoneNo)
{
	njdebug("phonepatterns", "normalizePhoneNo for " + phoneNo);
	if ((getValue("internationalPrefix") == null 
			|| trim(getValue("internationalPrefix")).length == 0)
	        && phoneNo.indexOf("+") >= 0)
	{
		njlog("The International Prefix has not been set. Please set it via the configuration panel before trying again");
		prompt.error("The International Prefix has not been set. Please set it via the configuration panel before trying again");
		throw "Invalid Configuration";
	}

	// remove all space
	phoneNo = phoneNo.replace(/\ /g, "");

	
	var delimiters = getValue("delimiters");
	if (delimiters == null)
		delimiters = "";
	
	// make certain we have no spaces in the delimiters.
	delimiters = delimiters.replace(/\ /g, "");

	// Now strip all of the delimiters from the phone no.
	njdebug("phonepatterns", "delimiters=" + delimiters);
	for (var i = 0; i < delimiters.length; i++)
		phoneNo = phoneNo.replace(new RegExp("\\" + delimiters.charAt(i), "g"), "");

	// Check if we have a local prefix which needs to be substituted.
	// eg. +613 becomes 03
	if ((getValue("localPrefix") != null 
			&& trim(getValue("localPrefix")).length > 0)
	        && phoneNo.indexOf(trim(getValue("localPrefix"))) == 0)
	{
		phoneNo = phoneNo.replace(trim(getValue("localPrefix")), trim(getValue("localPrefixSubstitution")))
	}

	// Finally expand the international prefix
	phoneNo = phoneNo.replace(/^\+/, getValue("internationalPrefix"));
	
	dialPrefix = getValue("dialPrefix");
	njdebug("phonepatterns", "dialPrefix=" + dialPrefix);
	if (dialPrefix != null)
		phoneNo = dialPrefix + phoneNo;
	
	njlog("normalised: " + phoneNo);
	return phoneNo;
}


//Translates phone words into real phone numbers.
//If the passed phoneword is already a valid number then the original number is
//simply returned.
function prepPhoneWords(phoneword)
{
	// handles phone words
	var number = String(phoneword).replace(/[\)\s-]/g, '').replace(/[abc]/ig, '2').replace(/[def]/ig, '3').replace(
	        /[ghi]/ig, '4').replace(/[jkl]/ig, '5').replace(/[mno]/ig, '6').replace(/[pqrs]/ig, '7').replace(/[tuv]/ig,
	        '8').replace(/[wxyz]/ig, '9');

	return number;
}

/**
 * comparision function used to sort string by length descending.
 */
function sortByLengthDesc(a, b)
{
	return b.length - a.length;
}

/*
 * Transposes a dial pattern into regex
 */
function transposePattern(pattern)
{
	njdebug("phonepatterns", "transposing pattern=" + pattern);
	var regex = new String();
	var regIndex = 0;
	var builder = new String();

	// Start by sorting all of the patterns by length so that the longest
	// pattern will
	// match first when patterns overlap.
	var patterns = pattern.split("\n");
	patterns.sort(sortByLengthDesc);
	pattern = "";
	for ( var i = 0; i < patterns.length; i++)
	{
		// We also take the opportunity to remove leading and trailing
		// whitespace
		// as due to the regex \b it will never match.
		pattern += trim(patterns[i]) + "\n";
	}

	njdebug("phonepatterns", "sorted patterns=" + pattern);

	var inBrackets = false;

	// Make the match case-insensative.
	pattern = pattern.toUpperCase();
	
	var delimiters = getValue("delimiters");

	var len = pattern.length;

	for (i = 0; i < len; i++)
	{
		// njdebug("phonepatterns", "char of pattern at pos =" + i + "'" + pattern[i] + "'");
		if (pattern[i] == 'X')
		{
			builder += "\\d";
		}
		else if (pattern[i] == 'Z')
		{
			builder += "[1-9]";
		}
		else if (isDigit(pattern[i]))
		{
			builder += pattern[i];
		}
		else if (pattern[i] == 'N')
		{
			builder += "[2-9]";
		}
		else if (pattern[i] == '[')
		{
			inBrackets = true;
			builder += "[";
		}
		else if (pattern[i] == ']')
		{
			inBrackets = false;
			builder += "]";
		}
		else if (inBrackets)
		{
			builder += pattern[i];
		}
/* deprecating the dot as a wildcard pattern match so that we can use it as a delimiter
 It doesn't actually seem usefull as a wild card as we need to match exact sequence lengths otherwise
 we get to many false positive recognitions.
		else if (pattern[i] == '.')
		{ 
			builder += "\\d+";
		}
*/		
		else if ("+".indexOf(pattern[i]) > -1)
		{
			builder += "\\" + pattern[i];
		}
		else if (delimiters.indexOf(pattern[i]) > -1)
		{
			builder += "\\" + pattern[i];
		}
		else if (pattern[i] == ' ')
		{
			builder += "\\s";
		}
		else if (pattern[i] == '\n')
		{
			if (builder.length > 0)
			{
				if (regIndex > 0)
					regex += "|";

				var word;
				// Add in word boundaries
				if (builder.length > 1 && (builder[1] == '(' || builder[1] == '+'))
					word = "[\\b" + Left(builder, 2) + "]" + builder.substring(2) + "\\b";
				else
					word = "\\b" + builder + "\\b";
				// Now add exclusion characters to the start and end of the
				// pattern
				// regex += "[^0-9$.#(-]" + word + "[^0-9$%)-]";
				regex += word;
				builder = new String();
				regIndex++;
			}
		}
		else
		{
			njlog("Unrecognized character '" + pattern[i] + "' found in pattern at pos=" + i);
			prompt.error("Unrecognized character '" + pattern[i] + "' found in pattern at pos=" + i);
			regex = null;
			break;
		}
	}

	if (regex)
	{
		if (builder.length > 0)
		{
			if (regIndex > 0)
				regex += "|";

			var word;
			if (builder.length > 1 && (builder[1] == '(' || builder[1] == '+'))
				word = "[\\b" + Left(builder, 2) + "]" + builder.substring(2) + "\\b";
			else
				word = "\\b" + builder + "\\b";
			// Now add exclusion characters to the start and end of the pattern
			// regex += "[^0-9$.#(-]" + word + "[^0-9$%)-]";
			regex += word;
		}
	}

	if (inBrackets == true)
	{
		njlog("Invalid pattern " + pattern + " missing close bracket ']'.");
		prompt.error("Invalid pattern " + pattern + " missing close bracket ']'.");
		regex = null;
	}

	njdebug("phonepatterns", "regex=" + regex);
	return regex;
}


function extractPhoneNo(text)
{
	var phone = "";

	// just pull numbers and spaces out of string
	// and a leading '+' if present.
	for ( var i = 0; i < text.length; i++)
	{
		var firstDigitSeen = false;
		if (isDigit(text.charAt(i)) || text.charAt(i) == ' ' || (!firstDigitSeen && text.charAt(i) == '+'))
			phone += text.charAt(i);
	}

	return phone;
}
