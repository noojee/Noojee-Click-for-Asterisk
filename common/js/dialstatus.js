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

noojeeClick.ns(function()
{
	with (noojeeClick.LIB)
	{

		theApp.dialstatus =
		{

		    self : null,
		    statusWindow : null,

		    getInstance : function()
		    {
			    if (this.self == null)
			    {
				    this.self = new this.DialStatus();
			    }
			    return this.self;
		    },

		    DialStatus : function()
		    {
			    this.updateStatus = function(status)
			    {
				    theApp.logging.njdebug("status", "updateStatus to " + status);
				    if (this.getStatusWindow() != null)
				    {
					    if (status == null || theApp.util.trim(status).length == 0)
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
			    };

			    this.getStatusWindow = function()
			    {
				    if (this.statusWindow == null)
				    {
					    if (window.document != null)
						    this.statusWindow = window.document.getElementById('noojeeStatus');
					    theApp.logging.njdebug("status", "statusWindow=null");
				    }

				    return this.statusWindow;
			    };

		    }

		};

	}
});
