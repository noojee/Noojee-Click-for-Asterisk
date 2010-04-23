// List of tags whose children we will scan looking for phone numbers
const
tagsOfInterest = [ "a", "abbr", "acronym", "address", "applet", "b", "bdo",
		"big", "blockquote", "body", "caption", "center", "cite", "code", "dd",
		"del", "div", "dfn", "dt", "em", "fieldset", "font", "form", "h1",
		"h2", "h3", "h4", "h5", "h6", "i", "iframe", "ins", "kdb", "li",
		"object", "pre", "p", "q", "samp", "small", "span", "strike", "s",
		"strong", "sub", "sup", "td", "th", "tt", "u", "var" ];

var xpath = "//text()[(parent::" + tagsOfInterest.join(" or parent::") + ")]";

function onRefresh()
{
	var documentList = getWindowList();

	for ( var i = 0; i < documentList.length; i++)
		onRefreshOne(documentList[i]);

}

function onRefreshOne(doc)
{
	njdebug("render", "onRefresh called for doc=" + doc);
	try
	{
		// First remove any clicks.
		var spans = doc.getElementsByName("noojeeClick");
		njdebug("render", "spans=" + spans);
		njdebug("render", "span.length=" + spans.length);

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
				var deleted = false;
				if (child.nodeName == "IMG")
				{
					if (child.name == "noojeeClickImg")
					{
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
				removalSpanArray[l].parentNode.removeChild(removalSpanArray[l]);
			else
				njdebug("render", "unexpected null parentNode for: "
						+ removalSpanArray[l]);
		}

		// Now add the Noojee Dial icons back in.
		if (getBoolValue("enabled") == true)
		{
			addClickToDialLinks(doc);
		}

	} catch (e)
	{
		njlog(e);
		showException("onRefreshOne", e);
	}
}

function addClickToDialLinks(document)
{
	if (excluded(document) == true)
		njdebug("render", "excluded=" + document.location.href);
	else
	{
		njdebug("render", "rendering: "
				+ (document.location ? document.location.href : document));

		var pattern = getValue("pattern");
		var delimiters = getValue("delimiters");
		njdebug("render", "pattern =" + pattern);

		if (pattern != null && trim(pattern).length != 0)
		{
			// Get the list of tags that we are gong to search for matching
			// phone numbers.
			var candidates = document.evaluate(xpath, document, null,
					XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

			// Get the list of regex patterns we are to match on.
			var trackRegex = new RegExp(transposePattern(pattern), "ig");
			njdebug("render", "regex=" + trackRegex);

			// Loop through and test every candidate for a match.
			for ( var cand = null, i = 0; (cand = candidates.snapshotItem(i)); i++)
			{

				njdebug("render", "examining node=" + cand.nodeValue);
				if (trackRegex.test(cand.nodeValue))
				{
					njdebug("render", "cand=" + cand);

					// Check that the node isn't owned by a document which is in
					// design mode (i.e. an editor).
					// If it is then we skip the node.
					if (document.getElementById(cand.id) != null)
					{
						var owner = document.getElementById(cand.id).ownerDocument;
						if (owner.designMode == "on" || owner.contentEditable == "on")
						{
							njdebug("render", "Found node in designMode, skipping");
							continue;
						}
					}
					else
						njdebug("render", "Can't find owner for cand");

					// First check that the parent isn't already a noojeeClick
					// element
					// In some case we appear to be processing the document
					// twice
					// but I've not found a simple way to suppress it so we do
					// this simple check
					if (cand.parentNode != null
							&& cand.parentNode.getAttribute("name") != "noojeeClick")
					{
						// Create an artificial parent span to insert the reworked
						// text
						var span = document.createElement("span");
						span.setAttribute("name", "noojeeClick");

						var source = cand.nodeValue;
						njdebug("render", "source=" + source);
						cand.parentNode.replaceChild(span, cand);
						trackRegex.lastIndex = 0;

						// var children[];
						// var previousMatch = null;

						// In a single piece of text we may have multiple
						// matches
						// so we need to iterate over the list of matches.
						// We go through the 'text' identifying each match
						// which we wrap in an image tag with the noojee click
						// icon.
						// As we go we rebuild the text into a single new parent
						// span ready for re-inserting into the original parent
						// with any noojee click images inserted.
						for ( var match = null, lastLastIndex = 0; (match = trackRegex
								.exec(source));)
						{
							// OK so we having a matching string
							njdebug("render", "match=" + match);

							// rebuild the original source string as we go by
							// adding the non-matching substrings
							// between the matching substrings.

							// Add the non-matching substring which appear
							// between
							// the matching substrings into the new parent node.
							var nonMatching = source.substring(lastLastIndex,
									match.index);

							// Check the characters immediately before and
							// after the matching digit.
							// If we find a digit, period,
							// comma, plus or minus sign before or after the
							// matching region then the match region is probably
							// part of some bigger number which isn't actually
							// a phone number. So mark it as non-matching and
							// move on.

							// check the preceding character
							if (match.index > 0)
							{
								//njlog("preceeding=" + source.substring(
								//	match.index - 1, match.index));
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
								//njlog("following=" + source.substring(
								//	match.index + match[0].length, match.index + match[0].length + 1));

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
							njdebug("render", "match is good");

							span.appendChild(document
									.createTextNode(nonMatching));

							// Now add matching substring with an image.
							var clickSpan = document.createElement("span");
							clickSpan.setAttribute("style",
									"white-space:nowrap");
							clickSpan.setAttribute("name", "noojeeClick");

							njdebug("render", "match[0]=" + match[0]);
							var text = document.createTextNode(match[0]);
							var img = document.createElement("img");
							img
									.setAttribute("src",
											"chrome://noojeeclick/content/images/micro.png");
							img.setAttribute("name", "noojeeClickImg");
							img.setAttribute("title", match[0]);
							img.addEventListener("onmouseover", onMouseOver,
									true);
							img
									.addEventListener("onmouseout", onMouseOut,
											true);
							img.addEventListener("click", onDialHandler, true);
							img.setAttribute("PhoneNo", match[0]);
							clickSpan.appendChild(text);
							clickSpan.appendChild(img);
							span.appendChild(clickSpan);
							lastLastIndex = trackRegex.lastIndex;
						}
						span.appendChild(document.createTextNode(source
								.substring(lastLastIndex)));
						span.normalize();
					}
				}
			}
		}
		njdebug("render", "rendering complete:" + new Date());
	}
}

/*
 * Determines if a document should be excluded by check if its URL matches any
 * of the URLs laid out in the excuded preferences.
 */
function excluded(doc)
{
	var excluded = false;

	if (doc.location != null)
	{
		njdebug("render", "checking exclusion for url=" + doc.location.href);

		var exclusions = getValue("exclusions");
		if (exclusions != null && exclusions.length != 0)
		{
			njdebug("render", "exclusions=" + exclusions);
			exclusions = exclusions.split("\n");
			for ( var i = 0; i < exclusions.length; i++)
			{
				var exclusion = trim(exclusions[i]);
				if (exclusion.length > 0)
				{
					if (doc.location.href.indexOf(exclusion) == 0)
					{
						njdebug("render", "excluded: " + doc.location.href);
						excluded = true;
						break;
					}
				}
			}
		} else
			njdebug("render", "No Exclusions.");
	}

	return excluded;
}
