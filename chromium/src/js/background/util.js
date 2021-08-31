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



var bgUtil = ( function( window, undefined ) 
{
	var instance = null;
	  
	// revealing module pattern that handles initialization of our new module
	function initializeNewModule() 
	{
		
		// Retrieves the channel name of the users own extension (including technology)
		// from the Noojee Click configuration.
		function getLocalChannel()
		{
			var channel = null;
			var extension = options.getInstance().getValue("extension");
			
			if (extension !== null)
			{
				if (extension.indexOf("/") == -1)
				{
					channel = "SIP/" + extension;
				}
				else
				{
					channel = extension;
				}
			}
			return channel;
		
		}
		
		function extractChannel(uniqueChannel)
		{
			var channel = uniqueChannel;
		
			var index = uniqueChannel.indexOf('-');
			if (index != -1)
			{
				channel = uniqueChannel.substring(0, index);
			}
			return channel;
		}	
			
		// Tests if the given channel (from an event usually) matches the users
		// local channel from Noojee Click's configuration.
		function isLocalChannel(channel)
		{
			return this.extractChannel(channel).toLowerCase() == this.getLocalChannel().toLowerCase();
		}
		
			
		
		return {
			getLocalChannel :getLocalChannel,
			extractChannel : extractChannel,
			isLocalChannel : isLocalChannel,
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
