noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.render =
{

// List of tags whose children we will scan looking for phone numbers
tagsOfInterest: [ "a", "abbr", "acronym", "address", "applet", "b", "bdo",
		"big", "blockquote", "body", "caption", "center", "cite", "code", "dd",
		"del", "div", "dfn", "dt", "em", "fieldset", "font", "form", "h1",
		"h2", "h3", "h4", "h5", "h6", "i", "iframe", "ins", "kdb", "li",
		"object", "pre", "p", "q", "samp", "small", "span", "strike", "s",
		"strong", "sub", "sup", "td", "th", "tt", "u", "var" ],


njClickElementType: "button",
njClickElementName: "noojeeClickImg",

onRefresh: function()
{
	var documentList = theApp.util.getWindowList();

	for ( var i = 0; i < documentList.length; i++)
		this.onRefreshOne(documentList[i]);

},


onRefreshOne: function (doc)
{
	
	theApp.util.njdebug("render", "onRefreshOne called for doc=" + doc);
	try
	{
		try
		{
			// Special check. It looks like an interaction problem between the monitor
			// and fckEditor. Anyway I'm guessing document has gone away by the time
			// the monitor kicks in. Any reference to the document will throw an error.
			// Given we don't want to add click to dial links to these type of pages
			// we just suppress the error by catching it and returning.
			if (doc == null || doc.location == null || doc.location.href == null)
			{
				return;
			}
		}
		catch (e)
		{
			theApp.util.njerror("excluded document with null href");
			return;
		}
		
		// First remove any noojeeClick spans.
		var spans = doc.getElementsByName("noojeeClick");
		theApp.util.njdebug("remove", "noojeeClick spans=" + spans);
		theApp.util.njdebug("remove", "span.length=" + spans.length);

		
		var removalSpanArray = [];
		var removedSpanItemCount = 0;
		for ( var i = spans.length - 1; i >= 0; i--)
		{
			var removalImageArray = [];
			var removedImageItemCount = 0;
			var span = spans[i];
			var parent = span.parentNode;

			var children = span.childNodes;
			var insertionPoint = span;
			for ( var j = children.length - 1; j >= 0; j--)
			{
				var child = children[j];
				theApp.util.njdebug("remove", "found child.nodeName=" + child.nodeName);
				theApp.util.njdebug("remove", "child.nodeValue=" + child.nodeValue);

				var deleted = false;
				if (child.nodeName.toLowerCase() == this.njClickElementType.toLowerCase())
				{
					if (child.name.toLowerCase() == this.njClickElementName.toLowerCase())
					{
						theApp.util.njdebug("remove", "removing child.nodeName=" + child.nodeName);
						removalImageArray[removedImageItemCount++] = child;
						deleted = true;
					}
				}
				if (deleted == false)
				{
					parent.insertBefore(child, insertionPoint);
					insertionPoint = child;
				}
			}

			for ( var k = 0; k < removedImageItemCount; k++)
			{
				span.removeChild(removalImageArray[k]);
			}
			removalSpanArray[removedSpanItemCount++] = span;
		}

		for ( var l = 0; l < removedSpanItemCount; l++)
		{
			if (removalSpanArray[l].parentNode != null)
			{
				var parentNode = removalSpanArray[l].parentNode;
				removalSpanArray[l].parentNode.removeChild(removalSpanArray[l]);
				parentNode.normalize();
			}
			else
				theApp.util.njdebug("remove", "unexpected null parentNode for: "
						+ removalSpanArray[l]);
		}

		

		// Now add the Noojee Dial icons back in.
		if (theApp.prefs.getBoolValue("showClickIcons") == true)
		{
			this.addClickToDialLinks(doc);
		}

	} 
	catch (e)
	{
		theApp.util.njerror(e);
		theApp.util.showException("onRefreshOne", e);
	}
},


addClickToDialLinks: function (document)
{
	try
	{
		if (this.excluded(document) == true)
			theApp.util.njdebug("render", "excluded=" + document.location.href);
		else
		{
			theApp.util.njdebug("render", "rendering: "
					+ (document.location ? document.location.href : document));
	
			var pattern = theApp.prefs.getValue("pattern");
			var delimiters = theApp.prefs.getValue("delimiters");
			theApp.util.njdebug("render", "pattern =" + pattern);
	
			if (pattern != null && theApp.util.trim(pattern).length != 0)
			{
				// Get the list of tags that we are gong to search for matching
				// phone numbers.
				var xpath = "//text()[(parent::" + this.tagsOfInterest.join(" or parent::") + ")]";
				var candidates = document.evaluate(xpath, document, null,
						XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
	
				// Get the list of regex patterns we are to match on.
				var trackRegex = new RegExp(theApp.phonepatterns.transposePattern(pattern), "ig");
				theApp.util.njdebug("render", "regex=" + trackRegex);
	
				// Loop through and test every candidate for a match.
				for ( var cand = null, i = 0; (cand = candidates.snapshotItem(i)); i++)
				{
	
					theApp.util.njdebug("render", "examining node=" + cand.nodeValue);
					if (trackRegex.test(cand.nodeValue))
					{
	
						// Check that the node isn't owned by a document which is in
						// design mode (i.e. an editor such as fckeditor).
						// If it is then we skip the node.
	
						theApp.util.njdebug("render", "Scanning for an editor parent for cand=" + cand);
	
						// Scan all of the owners checking for an editor
						var parent = cand.parentNode;
						var editable = false;
						while (parent != null)
						{
							if (parent.designMode == "on" 
							|| parent.designMode == "true"
							|| parent.contentEditable == "on"
							|| parent.contentEditable == "true"
							)
							{
								theApp.util.njdebug("render", "Found node in designMode, skipping");
								editable = true;
								break;
							}
							else if (parent.designMode == "off" 
							|| parent.designMode == "false"
							|| parent.contentEditable == "off"
							|| parent.contentEditable == "false"
							)
							{
								// parent isn't editable so search no further.
								break;
							}
							if (parent == parent.parentNode)
							{
								theApp.util.njerror("render", "bugger, self referencing parent.");
								// definition:bugger, from the latin australias - woe is
								// me, that shouldn't have happened.
								break;
							}
							
						 	parent = parent.parentNode;
						}
						
						if (editable)
							continue;
	
						// First check that the parent isn't already a noojeeClick
						// element
						// In some cases we appear to be processing the document
						// twice
						// but I've not found a simple way to suppress it so we do
						// this simple check
						if (cand.parentNode != null
								&& cand.parentNode.getAttribute("name") != "noojeeClick")
						{
							var candParent  = cand.parentNode;
							
							// We now remove the candidate as we are going to
							// re-insert it back into the parent piecemeal with noojeeclick
							// spans inserted around each phone number.
							// Remember each candidate can have multiple phone number present.
							candParent.removeChild(cand);
	
							var source = cand.nodeValue;
							theApp.util.njdebug("render", "source=" + source);
							trackRegex.lastIndex = 0;
	
							// In a single piece of text we may have multiple
							// matches
							// so we need to iterate over the list of matches.
							// We go through the 'text' identifying each phone
							// number
							// which we wrap in an image tag with the noojee click
							// icon.
							// As we go we re-insert the text back into the parent
							// (which
							// we removed it from)
							for ( var match = null, lastLastIndex = 0; (match = trackRegex
									.exec(source));)
							{
								// OK so we having a matching string
								theApp.util.njdebug("render", "match=" + match);
	
								// rebuild the original source string as we go by
								// adding the non-matching substrings
								// between the matching substrings.
	
								// Add the non-matching substring which appears
								// between
								// the matching substrings into the new parent node.
								var nonMatching = source.substring(lastLastIndex,
										match.index);
	
								// Check the characters immediately before and
								// after the matching digit.
								// If we find a digit, period,
								// comma, plus or minus sign or one of the defined
								// delimiters before or after the
								// matching region then the match region is probably
								// part of some bigger number which isn't actually
								// a phone number. So mark it as non-matching and
								// move on.
	
								// check the preceding character
								if (match.index > 0)
								{
									// njlog("preceeding=" + source.substring(
									// match.index - 1, match.index));
									if ("0123456789+-,.".indexOf(source.substring(
											match.index - 1, match.index)) != -1)
									{
										// the non match had an invalid character so
										// our number mustn't be a phone number.
										continue;
									}
									if (delimiters.indexOf(source.substring(
											match.index - 1, match.index)) != -1)
									{
										// the non match had an invalid character so
										// our number mustn't be a phone number.
										continue;
									}
								}
	
								// check the following character.
								if (match.index + match[0].length < source.length - 1)
								{
									// njlog("following=" + source.substring(
									// match.index + match[0].length, match.index +
									// match[0].length + 1));
	
									if ("0123456789+-,.".indexOf(source.substring(
											match.index + match[0].length,
											match.index + match[0].length + 1)) != -1)
									{
										// the non match had an invalid character so
										// our number mustn't be a phone number.
										continue;
									}
									if (delimiters.indexOf(source.substring(
											match.index + match[0].length,
											match.index + match[0].length + 1)) != -1)
									{
										// the non match had an invalid character so
										// our number mustn't be a phone number.
										continue;
									}
	
								}
								theApp.util.njdebug("render", "match is good");
	
								candParent.appendChild(document
										.createTextNode(nonMatching));
	
								// Now render the matching substring (phone number) with the noojee Click
								// element wrapping it so it becomes clickable.
								// We support a growing number of render styles.
								var renderStyle = "button";
								var text = document.createTextNode(match[0]);
								var clickElement = null;
								if (renderStyle == "anchor")
								{
									// Anchor link which is clickable but doesn't present with an icon
									var clickElement = document.createElement("a");
									clickElement.setAttribute("style", "cursor:pointer;");
									clickElement.addEventListener("click", theApp.handlers.onDialHandler, true);
//									a.addEventListener("mouseover", numInfo, false);
									clickElement.appendChild(text);
									clickElement.setAttribute("PhoneNo", match[0]);
									
								}
								else if (renderStyle == "button")
								{
									clickElement = document.createElement("span");
									clickElement.setAttribute("style",	"white-space:nowrap");
									clickElement.setAttribute("name", "noojeeClick");
		
									theApp.util.njdebug("render", "match[0]=" + match[0]);
									var btn = document.createElement(this.njClickElementType);
									btn.setAttribute("name", this.njClickElementName);
									btn.setAttribute("title", match[0]);
									btn.setAttribute("style", 
											"width: 16px; height: 14px; "
											+ "background: url('chrome://noojeeclick/content/images/call-phone.png') 0 0 no-repeat;" +
													"border: 0; padding: 0;");
									btn.addEventListener("click", theApp.handlers.onDialHandler, false);
									// We need to suppress any mouse action we may inherit from parent element 
									btn.addEventListener("mouseover", theApp.handlers.onMouseOver, false);
									btn.addEventListener("mouseout", theApp.handlers.onMouseOut, false);
									
									btn.setAttribute("PhoneNo", match[0]);
									
									clickElement.appendChild(text);
									clickElement.appendChild(btn);
								}
								candParent.appendChild(clickElement);
								lastLastIndex = trackRegex.lastIndex;
							}
							candParent.appendChild(document.createTextNode(source
									.substring(lastLastIndex)));
							candParent.normalize();
						}
					}
				}
			}
			theApp.util.njdebug("render", "rendering complete:" + new Date());
		}
	} 
	catch (e)
	{
		theApp.util.njerror(e);
		theApp.util.showException("addClickToDialLinks", e);
	}

},

/*
 * Determines if a document should be excluded by check if its URL matches any
 * of the URLs laid out in the excluded preferences.
 */
excluded: function (doc)
{
	var excluded = false;

	try
	{
		if (doc.location != null && doc.location.href != null)
		{
			theApp.util.njdebug("excluded", "checking exclusion for url=" + doc.location.href);
	
			var exclusions = theApp.prefs.getValue("exclusions");
			if (exclusions != null && exclusions.length != 0)
			{
				theApp.util.njdebug("excluded", "exclusions=" + exclusions);
				exclusions = exclusions.split("\n");
				for ( var i = 0; i < exclusions.length; i++)
				{
					var exclusion = theApp.util.trim(exclusions[i]);
					if (exclusion.length > 0)
					{
						if (doc.location.href != null && doc.location.href.indexOf(exclusion) == 0)
						{
							theApp.util.njdebug("excluded", "excluded: " + doc.location.href);
							excluded = true;
							break;
						}
					}
				}
			} 
			else
				theApp.util.njdebug("excluded", "No Exclusions.");
		}
	
	} 
	catch (e)
	{
		theApp.util.njerror(e);
		theApp.util.showException("excluded", e);
	}

	return excluded;
},

}

}});

