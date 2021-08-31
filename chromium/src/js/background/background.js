/**
 * Copyright 2012 Sven Werlen
 * 
 * This file is part of Noojee Click.
 * 
 * Noojee Click is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 * 
 * Noojee Click is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * Noojee Click. If not, see http://www.gnu.org/licenses/.
 */

var background = ( function( window, undefined ) 
{
  
  var instance = null;
  
  // revealing module pattern that handles initialization of our new module
  function initializeNewModule() 
  {
    
	  function dial()
	  {
		  return function (info, tab)
		  {
			  asterisk.getInstance().dial(info.selectionText);
		  };
	  }
	 
	  function editAndDial()
	  {
		  return function (info, tab)
		  {
			  // The srcUrl property is only available for image elements.
			  var url = 'http://127.0.0.1:7069/Dial/0' + info.selectionText;
			  // Create a new window to the info page.
			  chrome.windows.create({ url: url, width: 520, height: 660 });
		  };
	  }

	  function init()
	  {
		//options.getInstance();

		  /*******************************************
		  * Setup a listener to handle requests from the foreground contentscript
		  *******************************************/
		  chrome.extension.onRequest.addListener(
		  function(request, sender, sendResponse)
		  {
			  // content script requests for option values
			  if (request.type == "options")
			  {
			  // send response
				  sendResponse({option_values: localStorage});
			  }
			  // dial number
			  else if (request.type == "dial")
			  {
				  asterisk.getInstance().dial(request.phoneNo);
				  // empty response
				  sendResponse({});
			  }
			  // ignore invalid requests
			  else
			  {
				  sendResponse({});
			  }
		  }
		  );

	  }

    return {
    	init : init,
    	dial : dial,
    	editAndDial : editAndDial
    };
    
  }
  
  // handles the prevention of additional instantiations
  function getInstance() {
	  
    if( ! instance ) 
    {
      instance = new initializeNewModule();
    }
    return instance;
  }
  
  return {
    getInstance : getInstance
  };
  
} )( window );

// example usage
background.getInstance().init(); // initialise the background module
