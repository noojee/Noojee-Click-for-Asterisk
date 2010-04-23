/**
 * The monitor is designed to monitor dynamic (ajax) pages which may 
 * add phone numbers after the page load completes.
 * The PageMonitor monitors the lastModified date/time of the current page
 * if it changes it then it waits for the changes to stop and forces
 * a refresh of the page.
 * The interval we use to wait for a change to complete is quite short.
 * In reality, due to the single threaded nature of browsers, the wait timer
 * won't actually be called until the change has completed.
 * Asynchronous ajax calls may break this logic but we need to get the code
 * into the field to determine if this will be a problem.
 * 
 * TODO: update the code so that it only adds new click icons rather than
 * 	 simply refreshing the whole page.
 */


function Monitor()
{
	this.pageMonitorID = -1; // id of the timer which we use to monitor page changes 
	this.lastModified = new Date();
	this.lastModificationCheck = new Date();
	this.document = null;
	this.refreshRequired = false;
	this.duration = 400;	// The interval used to check if a page is changed.
	this.microDuration = 50; // once we detect a change the interval to check that the change has completed.
	this.suppressDomModification = false;
	
	/**
	 * initialises the monitor for the given document.
	 */
	this.init = function(document)
	{
		njdebug("monitor", "init called for document=" + document);
		this.document = document;
		var self = this;
		document.addEventListener("DOMSubtreeModified", function() { self.domModified(); }, false);
	}
	
	
	
	/** 
	 * Timer call back function used by startPageMonitor to monitor the active page
	 */
	this.monitorPage = function(self)
	{
		njdebug("monitor", "monitorPage called with ID=" + this.pageMonitorID.toString()
			+ " check=" + this.lastModificationCheck.toString()  + " actual=" + this.lastModified);
		var duration = this.duration;
		
		if (this.lastModificationCheck != this.lastModified)
		{
			njdebug("monitor", "Monitored document still changing=" + this.document);
			this.lastModificationCheck = this.lastModified;

			// The page is still changing so keep monitoring.
			this.pageMonitorID = window.setTimeout(function(self) {self.monitorPage(self); }, duration, this)
		}
		else
		{
			// The document has stopped changing and a refresh is required.
			this.suppressDomModification = true;
			njdebug("monitor", "Change complete forcing refresh for document=" + this.document);
			onRefreshOne(this.document);
			this.pageMonitorID = -1;
			njdebug("monitor", "Page Monitor stoped refresh complete for document=" + this.document);
		}
			
	}

	this.startPageMonitor = function()
	{
		njdebug("monitor", "Page Monitor Started ");

		this.pageMonitorID = window.setTimeout(function(self) {self.monitorPage(self); }, this.duration, this)
		njdebug("monitor", "Page Monitor Timer ID=" + this.pageMonitorID);
	}
	
	/**
	 * Called by the dom modifed event this method triggers
	 * the page Monitor which waits for the changes to stop
	 * and then refreshes the Noojee Click links.
	 * The suppressDomModification is designed to stop recursion as the 
	 * call to onRefreshOne will cause another dom modified event.
	 * The suppressDomModification flag allows us to ignore that subsequent
	 * event notification.
	 */
	this.domModified = function()
	{
		if (this.suppressDomModification == false)
		{
			// Wait for the page to stop changing before we attempt the refresh.
			this.lastModified = new Date();
			if (this.pageMonitorID == -1)
				this.startPageMonitor();
		}
		else
			this.suppressDomModification = false;
	}

};

