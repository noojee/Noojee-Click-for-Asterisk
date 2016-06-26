/**
 * Copyright 2012 Brett Sutton (Adapted for Google Chrome by Sven Werlen)
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


/**
 * Singleton window to display a dial status window.
 */

var dialstatus = ( function( window, undefined ) 
{
	var instance = null;
	var statusWindow = null;
	  
	// revealing module pattern that handles initialization of our new module
	function initializeNewModule() 
	{
	  
		function updateStatus(status)
		{
		    logging.getInstance().njdebug("status", "updateStatus to " + status);
		    if (this.getStatusWindow() !== null)
		    {
			    if (status === null || util.trim(status).length === 0)
			    {
				    // Hide the status window when not in use.
				    this.statusWindow.hidden = true;
				    this.statusWindow.label = "";
			    }
			    else
			    {
				    this.statusWindow.hidden = false;
				    this.statusWindow.label = status;
			    }
		    }
		}
		
		function getStatusWindow()
		{
		    if (this.statusWindow === null)
		    {
			    if (window.document !== null)
				    this.statusWindow = window.document.getElementById('noojeeStatus');
			    logging.getInstance().njdebug("status", "statusWindow=null");
		    }
		
		    return this.statusWindow;
		}

		return 
		{
			updateStatus : updateStatus,
			getStatusWindow : getStatusWindow
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
