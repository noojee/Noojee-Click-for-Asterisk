/**
 * Copyright 2012 Sven Werlen
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


var noojeeclick = ( function( window, undefined ) 
{
	var instance = null;
	var curnotification  = null;
	  
	// revealing module pattern that handles initialization of our new module
	function initializeNewModule() 
	{
		/**
			 * Shows a new notification
			 **/
		function show(icon, title, text, onCloseHandler)
		{
			logging.getInstance().njdebug("notification", "Showing " + title);
		
			this.hide();
			this.curnotification = window.webkitNotifications.createNotification(icon,title,text);
			this.curnotification.onclose = onCloseHandler;
			this.curnotification.show();
		}
		
		/**
		 * Hides current notification 
		 **/
		function hide()
		{
			if(this.curnotification) 
			{
				this.curnotification.onclose = null;
				this.curnotification.cancel();
				this.curnotification = null;
			}
		}
		
		function dialing(message)
		{
			// desktop notification "Dialing ...."
		  this.show('img/call.png',message,'Close this notification to hang-up immediately.',function() { asterisk.getInstance().hangup(); }	);
		
		}
		return 
		{
			show : show,
			hide : hide,
			dialing : dialing
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
