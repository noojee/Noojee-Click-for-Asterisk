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




noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.monitor =
{

Monitor: function ()
{
	this.pageMonitorID = null; // id of the timer which we use to monitor page changes
	this.lastModified = new Date();
	this.lastModificationCheck = new Date();
	this.document = null;
	this.refreshRequired = false;
	this.duration = 400;	// The interval used to check if a page has finished changing.
	this.suppressDomModification = false;
	this.wasModified = false; // Set to true if the page is modified whilst we don't have the focus.

	// We only want to monitor the page if it is the active tab.
	// This is a big performance boost when lots of tabs are open.
	this.isActive = false;  

	/**
	 * NoojeeClick.js calls the init method to initialises the monitor for each page as the page
	 * is loaded.
	 */
	this.init = function(document)
	{
		/*
		 * 
		 * We are taking the monitor function out until mozilla fixes their performance problems.
		 * 
		try
		{
			// Special check. It looks like an interaction problem between the monitor
			// and fckEditor. Anyway I'm guessing document has gone away by the time
			// the monitor kicks in. Any reference to the document will throw an error.
			// Given we don't want to add click to dial links to these type of pages
			// we just supress the error by catching it and returning.
			if (document == null || document.location == null || document.location.href == null)
			{
				return;
			}
			
			theApp.logging.njdebug("monitor", "init called for document=" + document);
			this.document = document;
			//var self = this;
			//document.addEventListener("DOMSubtreeModified", function() { self.domModified(); }, false);
			//document.addEventListener("focus", function() { self.onFocus(); }, false);
			//document.addEventListener("blur", function() { self.onBlur(); }, false);

		}
		catch (e)
		{
			theApp.logging.njerror("monitor ignoring document with null href");
			return;
		}
		*/

	};
	
	
	
	/** 
	 * Timer call back function used by startPageMonitor to monitor the active page
	 */
	this.monitorPage = function(self)
	{
		theApp.logging.njdebug("monitor", "monitorPage called with ID=" + this.pageMonitorID.toString()
			+ " check=" + this.lastModificationCheck.toString()  + " actual=" + this.lastModified);
		var duration = this.duration;
		
		if (this.lastModificationCheck != this.lastModified)
		{
			theApp.logging.njdebug("monitor", "Monitored document still changing=" + this.document.location);
			this.lastModificationCheck = this.lastModified;

			// The page is still changing so keep monitoring.
			this.pageMonitorID = window.setTimeout(function(self) {self.monitorPage(self); }, duration, this);
		}
		else
		{
			// The document has stopped changing and a refresh is required.
			this.suppressDomModification = true;
			theApp.logging.njdebug("monitor", "Dom has stopped changing so forcing refresh of document=" + this.document.location);
			theApp.render.onRefreshOne(this.document);
			this.pageMonitorID = null;
			theApp.logging.njdebug("monitor", "Page Monitor stopped, refresh complete for document=" + this.document.location);
			this.suppressDomModification = false;
			this.wasModified = false; 
		}
			
	};

	this.startPageMonitor = function()
	{
		theApp.logging.njdebug("monitor", "Page Monitor Started for: " + this.document.location);

		this.pageMonitorID = window.setTimeout(function(self) {self.monitorPage(self); }, this.duration, this);
		theApp.logging.njdebug("monitor", "Page Monitor Timer ID=" + this.pageMonitorID);
	};
	
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
		this.wasModified = true;
		if (theApp.prefs.getBoolValue("monitor") == true && this.isActive == true)
		{
			if (this.suppressDomModification == false)
			{
				// Wait for the page to stop changing before we attempt the refresh.
				this.lastModified = new Date();
				if (this.pageMonitorID == -1)
					this.startPageMonitor();
			}
		}
	};

	/** 
	 * When the page becomes active it gets the focus, so lets monitor it.
	 */
	this.onFocus = function()
	{
		this.isActive = true;
		
		// If the dom was modified whilst not in focus we now need to force a refresh.
		if (this.wasModified == true)
			this.domModified();
	};

	/** 
	 * When the page looses focus we are no longer interested in monitoring it.
	 */
	this.onBlur = function()
	{
		this.isActive = false;
	};
},


};

}});