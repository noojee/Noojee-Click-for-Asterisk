var EXPORTED_SYMBOLS = ["statusbar"];

Components.utils.import("resource://noojeeclick/util.jsm");


var statusbar = new StatusBar();

function StatusBar()
{
	this.window = null;
	
	this.init = function(window)
	{
		this.window = window;
	}
	
	/**
	 * Display hangup icon when we are on a call.
	 */
	this.showHangupIcon = function()
	{
		njdebug("statusbar", "showHangupIcon");
		var menuIcon = this.window.document.getElementById("noojeeMenu");
		menuIcon.hidden = true;
		
		var hangupIcon= this.window.document.getElementById("noojeeHangup");
		hangupIcon.hidden = false;
	}
	
	/** 
	 * Clear the hangup icon
	 */
	this.resetIcon = function()
	{
		njdebug("statusbar", "resetIcon");
		var menuIcon = this.window.document.getElementById("noojeeMenu");
		menuIcon.hidden = false;
		
		var hangupIcon= this.window.document.getElementById("noojeeHangup");
		hangupIcon.hidden = true;
		
		// After a slight delay clear the state.
		this.window.setTimeout("gAsterisk.updateState('');", 3000);
		
	}
	
	this.updateStatus = function(status)
	{
		var statusWindow = this.window.document.getElementById('noojeeStatus');
		
		if (statusWindow != null)
		{
			if (status == null || trim(status).length == 0)
			{
				// Hide the status window when not in use.
				statusWindow.hidden = true;
				statusWindow.label = "";
			}
			else
			{
				statusWindow.hidden = false;
				statusWindow.label = status;
			}
		}
		njdebug("statusbar", "Status set to " + status);
	}
	
}