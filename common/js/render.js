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
noojeeClick
        .ns(function()
        {
	        with (noojeeClick.LIB)
	        {

		        theApp.render =
		        {

		            /*
					 * List of tags whose children we will scan looking for phone numbers
					 */
		            tagsOfInterest : [ "a", "abbr", "acronym", "address", "applet", "b", "bdo", "big", "blockquote", "body",
		                    "caption", "center", "cite", "code", "dd", "del", "div", "dfn", "dt", "em", "fieldset", "font",
		                    "form", "h1", "h2", "h3", "h4", "h5", "h6", "i", "iframe", "ins", "kdb", "li", "object", "pre",
		                    "p", "q", "samp", "small", "span", "strike", "s", "strong", "sub", "sup", "td", "th", "tt", "u",
		                    "var" ],

		            njClickElementType : "button",
		            njClickElementName : "noojeeClickImg",

		            onRefresh : function()
		            {
			            var documentList = theApp.util.getWindowList();

			            for ( var i = 0; i < documentList.length; i++)
				            this.onRefreshOne(documentList[i]);

		            },

		            onRefreshOne : function(doc)
		            {

			            theApp.logging.njdebug("render", "onRefreshOne called for doc=" + doc);
			            try
			            {
				            try
				            {
					            /*
								 * Special check. It looks like an interaction problem between the monitor and fckEditor. Anyway
								 * I'm guessing document has gone away by the time the monitor kicks in. Any reference to the
								 * document will throw an error. Given we don't want to add click to dial links to these type of
								 * pages we just suppress the error by catching it and returning. Note: the monitor is currently
								 * disabled due to massive performance problems with firefox.
								 */
					            if (doc == null || doc.location == null || doc.location.href == null)
					            {
						            return;
					            }
				            }
				            catch (e)
				            {
					            theApp.logging.njerror("excluded document with null href");
					            return;
				            }

				            // First remove any noojeeClick spans.
				            var spans = doc.getElementsByName("noojeeClick");
				            theApp.logging.njdebug("remove", "noojeeClick spans=" + spans);
				            theApp.logging.njdebug("remove", "span.length=" + spans.length);

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
						            theApp.logging.njdebug("remove", "found child.nodeName=" + child.nodeName);
						            theApp.logging.njdebug("remove", "child.nodeValue=" + child.nodeValue);

						            var deleted = false;
						            if (child.nodeName.toLowerCase() == this.njClickElementType.toLowerCase())
						            {
							            if (child.name.toLowerCase() == this.njClickElementName.toLowerCase())
							            {
								            theApp.logging.njdebug("remove", "removing child.nodeName=" + child.nodeName);
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
						            theApp.logging.njdebug("remove", "unexpected null parentNode for: " + removalSpanArray[l]);
				            }

				            // Now add the Noojee Dial icons back in.
				            if (theApp.prefs.getBoolValue("showClickIcons") == true)
				            {
					            this.addClickToDialLinks(doc);
				            }

			            }
			            catch (e)
			            {
				            theApp.logging.njerror(e);
				            theApp.util.showException("render.onRefreshOne", e);
			            }
		            },

		            addClickToDialLinks : function(document)
		            {
			            try
			            {
				            if (this.excluded(document) == true)
					            theApp.logging.njdebug("render", "excluded=" + document.location.href);
				            else
				            {
					            theApp.logging.njdebug("render", "rendering: "
					                    + (document.location ? document.location.href : document));

					            var pattern = theApp.prefs.getValue("pattern");
					            var delimiters = theApp.prefs.getValue("delimiters");
					            theApp.logging.njdebug("render", "pattern =" + pattern);

					            if (pattern != null && theApp.util.trim(pattern).length != 0)
					            {
						            /*
									 * Get the list of tags that we are gong to search for matching phone numbers.
									 */
						            var xpath = "//text()[(parent::" + this.tagsOfInterest.join(" or parent::") + ")]";
						            
						            /**
						             * Seach the document for any tag which is in the set of 'tagsOfInterest'.
						             * candidateTags contain the list of tags from the active document
						             * which we need to search for phone numbers.
						             */
						            var candidateTags = document.evaluate(xpath, document, null,
						                    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

						            /*
									 * Get the list of regex patterns we are to match on.
									 */
						            var phonePatternRegex = new RegExp(theApp.phonepatterns.transposePattern(pattern), "ig");
						            theApp.logging.njdebug("render", "regex=" + phonePatternRegex);

						            /*
									 * Loop through and test every candidateTag to see if it contains a phone number.
									 */
						            for ( var candidateTag = null, i = 0; (candidateTag = candidateTags.snapshotItem(i)); i++)
						            {

							            theApp.logging.njdebug("render", "examining node=" + candidateTag.nodeValue);
							            /*
							             * Examine the candidateTags content (nodeValue) to see if it has a phone number.
							             */
							            if (phonePatternRegex.test(candidateTag.nodeValue))
							            {
							            	/* Looks like the candidateTag contains a phone number */
							            	
								            /*
											 * Check that the node isn't owned by a document which is in design mode (i.e. an
											 * editor such as fckeditor). If it is then we skip the node.
											 */
								            theApp.logging.njdebug("render", "Scanning for an editor parent for cand=" + candidateTag);

								            /*
											 * Scan all of the owners checking for an editor. If we are owned by an editor then
											 * skip this tag.
											 */

								            var parent = candidateTag.parentNode;
								            var editable = false;
								            while (parent != null)
								            {
									            if (parent.designMode == "on" || parent.designMode == "true"
									                    || parent.contentEditable == "on" || parent.contentEditable == "true")
									            {
										            theApp.logging.njdebug("render", "Found node in designMode, skipping");
										            editable = true;
										            break;
									            }
									            else if (parent.designMode == "off" || parent.designMode == "false"
									                    || parent.contentEditable == "off" || parent.contentEditable == "false")
									            {
										            /*
													 * parent isn't editable so search no further.
													 */
										            break;
									            }
									            if (parent == parent.parentNode)
									            {
										            theApp.logging.njerror("render", "bugger, self referencing parent.");
										            /*
													 * definition:bugger, from the latin australias - Woe is me, that shouldn't
													 * have happened.
													 */
										            break;
									            }

									            parent = parent.parentNode;
								            }

								            /*
								             * If the candidateTag is editable then we aren't interested so lets skip out of here.
								             */
								            if (editable) continue;

								            /*
											 * First check that the parent isn't already a noojeeClick element. In some cases we
											 * appear to be processing the document twice but I've not found a simple way to
											 * suppress it so we do this simple check
											 */
								            if (candidateTag.parentNode != null
								                    && candidateTag.parentNode.getAttribute("name") != "noojeeClick")
								            {
									            var candParent = candidateTag.parentNode;

									            /*
									             * Start by determining where to re-insert the tag
									             * i.e. some candidate tags will have siblings.
									             */
									            var insertPosition = candidateTag.nextSibling;
									            

									            /*
												 * We now remove the candidateTag as we are going to re-insert it back into the
												 * parent piecemeal with noojeeclick spans inserted around each phone number.
												 * Remember each candidateTag can have multiple phone numbers present.
												 */
									            candParent.removeChild(candidateTag);
									            
									            var candidateContents = candidateTag.nodeValue;
									            theApp.logging.njdebug("render.build", "candidateContents=" + candidateContents);
									            phonePatternRegex.lastIndex = 0;

									            /*
												 * In a single piece of text we may have multiple matches so we need to iterate
												 * over the list of matches. We go through the 'text' identifying each phone
												 * number which we wrap in an span tag with the noojee click icon. As we go we
												 * re-insert the text back into the parent (which we removed it from)
												 */
									            for ( var match = null, lastLastIndex = 0; (match = phonePatternRegex.exec(candidateContents));)
									            {
										            /*
													 * OK so we having a matching string
													 */
									            	theApp.logging.njdebug("render.build", "match=" + match);

										            /*
													 * rebuild the original source string as we go by adding the non-matching
													 * substrings between the matching substrings.
													 */

										            /*
													 * Add the non-matching substring which appears between the matching
													 * substrings into the new parent node.
													 */
										            var nonMatching = candidateContents.substring(lastLastIndex, match.index);

										            /*
													 * Check the characters immediately before and after the matching digit. If
													 * we find a digit, period, comma, plus or minus sign or one of the defined
													 * delimiters before or after the matching region then the match region is
													 * probably part of some bigger number which isn't actually a phone number.
													 * So mark it as non-matching and move on.
													 */

										            /*
													 * check the preceding character
													 */
										            if (match.index > 0)
										            {
											            /*
														 * njlog("preceeding=" + source.substring( match.index - 1,
														 * match.index));
														 */
											            if ("0123456789+-,.".indexOf(candidateContents.substring(match.index - 1,
											                    match.index)) != -1)
											            {
												            /*
															 * the non match had an invalid character so our number mustn't be a
															 * phone number. 
															 */
											            	continue;
											            }
											            if (delimiters.indexOf(candidateContents.substring(match.index - 1, match.index)) != -1)
											            {
												            /*
															 * the non match contained a delimiter so our number mustn't be a
															 * phone number. 
															 */
											            	continue;
											            }
										            }

										            /*
													 * check the following character.
													 */
										            if (match.index + match[0].length < candidateContents.length - 1)
										            {
											            /*
														 * njlog("following=" + source.substring( match.index + match[0].length,
														 * match.index + match[0].length + 1));
														 */
											            if ("0123456789+-,.".indexOf(candidateContents.substring(match.index
											                    + match[0].length, match.index + match[0].length + 1)) != -1)
											            {
												            /*
															 * the non match had an invalid character so our number mustn't be a
															 * phone number.
															 */
												            continue;
											            }
											            if (delimiters.indexOf(candidateContents.substring(match.index + match[0].length,
											                    match.index + match[0].length + 1)) != -1)
											            {
												            /*
															 * the non match had an invalid character so our number mustn't be a
															 * phone number.
															 */
												            continue;
											            }

										            }
										            theApp.logging.njdebug("render.build", "match is good");

										            theApp.logging.njdebug("render.build", "appending" + nonMatching);
										            if (insertPosition == null)
										            	candParent.appendChild(document.createTextNode(nonMatching));
										            else
										            	candParent.insertBefore(document.createTextNode(nonMatching), insertPosition);

										            /*
													 * Now render the matching substring (phone number) with the noojee Click
													 * element wrapping it so it becomes clickable. We support a growing number
													 * of render styles.
													 */
										            var renderStyle = "button";
										            var text = document.createTextNode(match[0]);
										            var clickElement = null;
										            if (renderStyle == "anchor")
										            {
											            /*
														 * Anchor link which is clickable but doesn't present with an icon
														 */
											            clickElement = document.createElement("a");
											            clickElement.setAttribute("style", "cursor:pointer;");
											            clickElement.addEventListener("click", theApp.handlers.onDialHandler,
											                    true);
											            clickElement.appendChild(text);
											            clickElement.setAttribute("PhoneNo", match[0]);

										            }
										            else if (renderStyle == "button")
										            {
											            clickElement = document.createElement("span");
											            clickElement.setAttribute("style", "white-space:nowrap");
											            clickElement.setAttribute("name", "noojeeClick");
											            clickElementid = "noojeeClick-click";

											            theApp.logging.njdebug("render", "match[0]=" + match[0]);
											            var btn = document.createElement(this.njClickElementType);
											            btn.setAttribute("name", this.njClickElementName);
											            btn.id = "noojeeClick-btn";
											            btn.setAttribute("title", match[0]);
															var imgURL = theApp.prefs.CONST_IMG_CALLPHONE;
											            btn.setAttribute(
																	"style",
																	"width: 16px; height: 14px; "
																		+ "background: url('" + imgURL + "') 0 0 no-repeat;"
																		+ "border: 0; padding: 0;");
																	  
											            btn.addEventListener("click", theApp.handlers.onDialHandler, false);
											            /*
														 * We need to suppress any mouse action we may inherit from parent
														 * element
														 */
											            btn.addEventListener("mouseover", theApp.handlers.onMouseOver, false);
											            btn.addEventListener("mouseout", theApp.handlers.onMouseOut, false);

											            btn.setAttribute("PhoneNo", match[0]);

											            clickElement.appendChild(text);
											            clickElement.appendChild(btn);
										            }
										            theApp.logging.njdebug("render.build", "appending" + clickElement);
										            if (insertPosition == null)
										            candParent.appendChild(clickElement);
										            else
										            	candParent.insertBefore(clickElement, insertPosition);

										            lastLastIndex = phonePatternRegex.lastIndex;
									            }
									            theApp.logging.njdebug("render.build", "appending" + candidateContents.substring(lastLastIndex));
									            if (insertPosition == null)
									            	candParent.appendChild(document.createTextNode(candidateContents.substring(lastLastIndex)));
									            else
									            	candParent.insertBefore(document.createTextNode(candidateContents.substring(lastLastIndex)), insertPosition);
									            
									            candParent.normalize();
								            }
							            }
						            }
					            }
					            theApp.logging.njdebug("render", "rendering complete:" + new Date());
				            }
			            }
			            catch (e)
			            {
				            theApp.logging.njerror(e);
				            theApp.util.showException("render.addClickToDialLinks", e);
			            }

		            },

		            /*
					 * Determines if a document should be excluded by check if its URL matches any of the URLs laid out in the
					 * excluded preferences.
					 */
		            excluded : function(doc)
		            {
			            var excluded = false;

			            try
			            {
				            if (doc.location != null && doc.location.href != null)
				            {
					            theApp.logging.njdebug("excluded", "checking exclusion for url=" + doc.location.href);

					            var exclusions = theApp.prefs.getValue("exclusions");
					            if (exclusions != null && exclusions.length != 0)
					            {
						            theApp.logging.njdebug("excluded", "exclusions=" + exclusions);
						            exclusions = exclusions.split("\n");
						            for ( var i = 0; i < exclusions.length; i++)
						            {
							            var exclusion = theApp.util.trim(exclusions[i]);
							            if (exclusion.length > 0)
							            {
								            if (doc.location.href != null && doc.location.href.indexOf(exclusion) == 0)
								            {
									            theApp.logging.njdebug("excluded", "excluded: " + doc.location.href);
									            excluded = true;
									            break;
								            }
							            }
						            }
					            }
					            else
						            theApp.logging.njdebug("excluded", "No Exclusions.");
				            }

			            }
			            catch (e)
			            {
				            theApp.logging.njerror(e);
				            theApp.util.showException("render.excluded", e);
			            }

			            return excluded;
		            },

		        };

	        }
        });
