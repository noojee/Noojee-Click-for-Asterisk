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

theApp.phonepatterns =
{
 
/*
 * normalisePhoneNo non-numeric characters from the phone number ready to use in
 * dial string
 */ 
normalisePhoneNo: function (phoneNo)
{
	theApp.logging.njdebug("phonepatterns", "normalizePhoneNo for " + phoneNo);
	if ((theApp.prefs.getValue("internationalPrefix") == null 
			|| theApp.util.trim(theApp.prefs.getValue("internationalPrefix")).length == 0)
	        && phoneNo.indexOf("+") >= 0)
	{
		theApp.logging.njlog("The International Prefix has not been set. Please set it via the configuration panel before trying again");
		theApp.prompts.njAlert("The International Prefix has not been set. Please set it via the configuration panel before trying again");
		throw "Invalid Configuration";
	}

	// remove all space
	phoneNo = phoneNo.replace(/\ /g, "");

	
	var delimiters = theApp.prefs.getValue("delimiters");
	if (delimiters == null)
		delimiters = "";
	
	// make certain we have no spaces in the delimiters.
	delimiters = delimiters.replace(/\ /g, "");

	// Now strip all of the delimiters from the phone no.
	theApp.logging.njdebug("phonepatterns", "delimiters=" + delimiters);
	for (var i = 0; i < delimiters.length; i++)
		phoneNo = phoneNo.replace(new RegExp("\\" + delimiters.charAt(i), "g"), "");

	// Check if we have a local prefix which needs to be substituted.
	// eg. +613 becomes 03
	if ((theApp.prefs.getValue("localPrefix") != null 
			&& theApp.util.trim(theApp.prefs.getValue("localPrefix")).length > 0)
	        && phoneNo.indexOf(theApp.util.trim(theApp.prefs.getValue("localPrefix"))) == 0)
	{
		phoneNo = phoneNo.replace(theApp.util.trim(theApp.prefs.getValue("localPrefix"))
			, theApp.util.trim(theApp.prefs.getValue("localPrefixSubstitution")));
	}

	// Finally expand the international prefix
	phoneNo = phoneNo.replace(/^\+/, theApp.prefs.getValue("internationalPrefix"));
	
	var dialPrefix = theApp.prefs.getValue("dialPrefix");
	theApp.logging.njdebug("phonepatterns", "dialPrefix=" + dialPrefix);
	if (dialPrefix != null)
		phoneNo = dialPrefix + phoneNo;
	
	theApp.logging.njlog("normalised: " + phoneNo);
	return phoneNo;
},


//Translates phone words into real phone numbers.
//If the passed phoneword is already a valid number then the original number is
//simply returned.
prepPhoneWords: function (phoneword)
{
	// handles phone words
	var number = String(phoneword).replace(/[\)\s-]/g, '').replace(/[abc]/ig, '2').replace(/[def]/ig, '3').replace(
	        /[ghi]/ig, '4').replace(/[jkl]/ig, '5').replace(/[mno]/ig, '6').replace(/[pqrs]/ig, '7').replace(/[tuv]/ig,
	        '8').replace(/[wxyz]/ig, '9');

	return number;
},

/**
 * comparision function used to sort string by length descending.
 */
sortByLengthDesc: function (a, b)
{
	return b.length - a.length;
},

/*
 * Transposes a dial pattern into regex
 */
transposePattern: function (patternList)
{
	theApp.logging.njdebug("phonepatterns", "transposing pattern=" + patternList);
	var regex = new String();
	var regIndex = 0;

	// Start by sorting all of the patterns by length so that the longest
	// pattern will
	// match first when patterns overlap.
	var patterns = theApp.util.trim(patternList).split("\n");
	patterns.sort(this.sortByLengthDesc);
	theApp.logging.njdebug("phonepatterns", "sorted patterns=" + patterns);

	var delimiters = theApp.prefs.getValue("delimiters");

	// We validate the patterns as we go and only write back
	// the patterns that are valid.
	var validPatterns = new String();
	
	var pattern = "";
	var builder = new String();
	for ( var j = 0; j < patterns.length; j++)
	{
		// We also take the opportunity to remove leading and trailing
		// whitespace
		// as due to the regex \b it will never match.
		pattern = theApp.util.trim(patterns[j]);

		// Make the match case-insensative.
		pattern = pattern.toUpperCase();
	
		var inBrackets = false;
		var validPattern = true;
		builder = new String();

		var len = pattern.length;

		for (var i = 0; i < len; i++)
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
			else if (theApp.util.isDigit(pattern[i]))
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
			else
			{
				theApp.logging.njlog("Unrecognized character '" + pattern[i] + "' found in pattern " + pattern);
				validPattern = false;
				break;
			}
		}

		if (inBrackets == true)
		{
			theApp.logging.njlog("Invalid pattern " + pattern + " missing close bracket ']'.");
			theApp.prompts.njAlert("Invalid pattern " + pattern + " missing close bracket ']'.");
			validPattern = false;
		}

		if (validPattern && builder != null && builder.length > 0)
		{
			if (regIndex > 0)
				regex += "|";

			var word;
			// Add in word boundaries
			if (builder.length > 1 && (builder[1] == '(' || builder[1] == '+'))
				word = "[\\b" + theApp.util.Left(builder, 2) + "]" + builder.substring(2) + "\\b";
			else
				word = "\\b" + builder + "\\b";
			// Now add exclusion characters to the start and end of the
			// pattern
			// regex += "[^0-9$.#(-]" + word + "[^0-9$%)-]";
			regex += word;
			builder = new String();
			regIndex++;
		}
		
		if (validPattern)
		{
			if (validPatterns.length > 0) 
				validPatterns += "\n";
			validPatterns += pattern;
		}
	}
	
	
	// write the valid patterns back to the config
	// We must always leave a single blank line to allow a user
	// to add an new pattern at the bottom.
	// Due to the immediate update mechanism the transposePatterns method
	// is called as soon as the user attempts to enter a new line.
	// Without the trailing \n here the newline gets instantly removed.
	theApp.prefs.setValue("pattern", validPatterns + "\n");
	

	if (regex)
	{
		if (builder.length > 0)
		{
			if (regIndex > 0)
				regex += "|";

			var word;
			if (builder.length > 1 && (builder[1] == '(' || builder[1] == '+'))
				word = "[\\b" + theApp.util.Left(builder, 2) + "]" + builder.substring(2) + "\\b";
			else
				word = "\\b" + builder + "\\b";
			// Now add exclusion characters to the start and end of the pattern
			// regex += "[^0-9$.#(-]" + word + "[^0-9$%)-]";
			regex += word;
		}
	}


	theApp.logging.njdebug("phonepatterns", "regex=" + regex);
	return regex;
},


extractPhoneNo: function (text)
{
	var phone = "";

	// just pull numbers and spaces out of string
	// and a leading '+' if present.
	for ( var i = 0; i < text.length; i++)
	{
		var firstDigitSeen = false;
		if (theApp.util.isDigit(text.charAt(i)) || text.charAt(i) == ' ' || (!firstDigitSeen && text.charAt(i) == '+'))
			phone += text.charAt(i);
	}

	return phone;
}


};

}});