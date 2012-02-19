
noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.dialstatus =
{

self: null,
statusWindow: null,

getInstance: function()
{
	if (this.self == null)
	{
		this.self = new this.DialStatus();
	}
	return this.self;
},

DialStatus: function ()
{
	this.updateStatus = function(status)
	{
		theApp.util.njdebug("status", "updateStatus to " + status);
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
	}
	
	this.getStatusWindow = function ()
	{
		if (this.statusWindow == null)
		{
			this.statusWindow = window.document.getElementById('noojeeStatus');
			theApp.util.njdebug("status", "statusWindow=null");
		}
		
		return this.statusWindow;
	}
	
}



}


}});
