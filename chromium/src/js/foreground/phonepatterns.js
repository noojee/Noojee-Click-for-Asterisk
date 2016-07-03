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
 

var phonePatterns = ( function( window, undefined ) 
{
	var instance = null;
	  
	// revealing module pattern that handles initialization of our new module
	function initializeNewModule() 
	{
	  
		/*
		 * normalisePhoneNo non-numeric characters from the phone number ready to use in dial string
		 */ 
		function normalisePhoneNo(phoneNo)
		{
			logging.getInstance().njdebug("phonepatterns", "normalizePhoneNo for " + phoneNo);
			if ((optionsAccessor.getInstance().getValue("internationalPrefix") === null 
					|| util.trim(optionsAccessor.getInstance().getValue("internationalPrefix")).length === 0)
			        && phoneNo.indexOf("+") >= 0)
			{
				logging.getInstance().njlog("The International Prefix has not been set. Please set it via the configuration panel before trying again");
				prompts.njAlert("The International Prefix has not been set. Please set it via the configuration panel before trying again");
				throw "Invalid Configuration";
			}
		
			// remove all space
			phoneNo = phoneNo.replace(/\ /g, "");
		
			
			var delimiters = optionsAccessor.getInstance().getValue("delimiters");
			if (delimiters === null)
				delimiters = "";
			
			// make certain we have no spaces in the delimiters.
			delimiters = delimiters.replace(/\ /g, "");
		
			// Now strip all of the delimiters from the phone no.
			logging.getInstance().njdebug("phonepatterns", "delimiters=" + delimiters);
			for (var i = 0; i < delimiters.length; i++)
				phoneNo = phoneNo.replace(new RegExp("\\" + delimiters.charAt(i), "g"), "");
		
			// Check if we have a local prefix which needs to be substituted.
			// eg. +613 becomes 03
			if ((optionsAccessor.getInstance().getValue("localPrefix") !== null 
					&& util.trim(optionsAccessor.getInstance().getValue("localPrefix")).length > 0)
			        && phoneNo.indexOf(util.trim(optionsAccessor.getInstance().getValue("localPrefix"))) === 0)
			{
				phoneNo = phoneNo.replace(util.trim(optionsAccessor.getInstance().getValue("localPrefix")), util.trim(optionsAccessor.getInstance().getValue("localPrefixSubstitution")));
			}
		
			// Finally expand the international prefix
			phoneNo = phoneNo.replace(/^\+/, optionsAccessor.getInstance().getValue("internationalPrefix"));
			
			var dialPrefix = optionsAccessor.getInstance().getValue("dialPrefix");
			logging.getInstance().njdebug("phonepatterns", "dialPrefix=" + dialPrefix);
			if (dialPrefix !== null)
				phoneNo = dialPrefix + phoneNo;
			
			logging.getInstance().njlog("normalised: " + phoneNo);
			return phoneNo;
		}
	
	
		// Translates phone words into real phone numbers.
		// If the passed phoneword is already a valid number then the original number is
		// simply returned.
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
		function transposePattern(patternList)
		{
			logging.getInstance().njdebug("phonepatterns", "transposing pattern=" + patternList);
			var regex = "";
			var regIndex = 0;
		
			// Start by sorting all of the patterns by length so that the longest
			// pattern will
			// match first when patterns overlap.
			var patterns = util.trim(patternList).split("\n");
			patterns.sort(this.sortByLengthDesc);
			logging.getInstance().njdebug("phonepatterns", "sorted patterns=" + patterns);
		
			var delimiters = optionsAccessor.getInstance().getValue("delimiters");
		
			// We validate the patterns as we go and only write back
			// the patterns that are valid.
			var validPatterns = "";
			
			var pattern = "";
			var builder = "";
			for ( var j = 0; j < patterns.length; j++)
			{
				// We also take the opportunity to remove leading and trailing
				// whitespace
				// as due to the regex \b it will never match.
				pattern = util.trim(patterns[j]);
		
				// Make the match case-insensative.
				pattern = pattern.toUpperCase();
			
				var inBrackets = false;
				var validPattern = true;
				builder = "";
		
				var len = pattern.length;
		
				for (var i = 0; i < len; i++)
				{
					// njdebug("phonepatterns", "char of pattern at pos =" + i + "'" +
					// pattern[i] + "'");
					if (pattern[i] == 'X')
					{
						builder += "\\d";
					}
					else if (pattern[i] == 'Z')
					{
						builder += "[1-9]";
					}
					else if (util.isDigit(pattern[i]))
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
			/*
			 * deprecating the dot as a wildcard pattern match so that we can use it as a delimiter It doesn't actually seem usefull as a wild card as we need
			 * to match exact sequence lengths otherwise we get to many false positive recognitions. else if (pattern[i] == '.') { builder += "\\d+"; }
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
						logging.getInstance().njlog("Unrecognized character '" + pattern[i] + "' found in pattern " + pattern);
						validPattern = false;
						break;
					}
				}
		
				if (inBrackets === true)
				{
					logging.getInstance().njlog("Invalid pattern " + pattern + " missing close bracket ']'.");
					prompts.njAlert("Invalid pattern " + pattern + " missing close bracket ']'.");
					validPattern = false;
				}
		
				if (validPattern && builder !== null && builder.length > 0)
				{
					if (regIndex > 0)
						regex += "|";
		
					var word;
					// Add in word boundaries
					if (builder.length > 1 && (builder[1] == '(' || builder[1] == '+'))
						word = "[\\b" + util.Left(builder, 2) + "]" + builder.substring(2) + "\\b";
					else
						word = "\\b" + builder + "\\b";
					// Now add exclusion characters to the start and end of the
					// pattern
					// regex += "[^0-9$.#(-]" + word + "[^0-9$%)-]";
					regex += word;
					builder = "";
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
			optionsAccessor.getInstance().setValue("pattern", validPatterns + "\n");
			
		
			if (regex)
			{
				if (builder.length > 0)
				{
					if (regIndex > 0)
						regex += "|";
		
					var wordregex;
					if (builder.length > 1 && (builder[1] == '(' || builder[1] == '+'))
						wordregex = "[\\b" + util.Left(builder, 2) + "]" + builder.substring(2) + "\\b";
					else
						wordregex = "\\b" + builder + "\\b";
					// Now add exclusion characters to the start and end of the pattern
					// regex += "[^0-9$.#(-]" + word + "[^0-9$%)-]";
					regex += wordregex;
				}
			}
		
		
			logging.getInstance().njdebug("phonepatterns", "regex=" + regex);
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
				if (util.isDigit(text.charAt(i)) || text.charAt(i) == ' ' || (!firstDigitSeen && text.charAt(i) == '+'))
					phone += text.charAt(i);
			}
		
			return phone;
		}
	
		return {
			normalisePhoneNo : normalisePhoneNo,
			prepPhoneWords : prepPhoneWords,
			transposePattern : transposePattern,
		    extractPhoneNo : extractPhoneNo
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

  
  
  


