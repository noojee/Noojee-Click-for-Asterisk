var noojeeClick = {};


(function() 
{

	// for debugging as we can't use njdebug during the initialisation.
	var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService);
        
	// Registration
	var namespaces = [];
	
	this.ns = function(fn) 
	{
	    var ns = {};
	    namespaces.push(fn, ns);
	
	    return ns;
	};

	this.onPageLoad = function(event)
	{
		noojeeClick.noojeeclick.onPageLoad(event);
	};

	this.onRefresh = function()
	{
		noojeeClick.render.onRefresh();
	};
	
	this.showMenuHideItems = function()
	{
		noojeeClick.noojeeclick.showMenuHideItems();
	};
	
	
	function PrefListener(branchName, func)
	{
		var prefService = Components.classes["@mozilla.org/preferences-service;1"]
		        .getService(Components.interfaces.nsIPrefService);
		var branch = prefService.getBranch(branchName);
		branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
	
		this.register = function()
		{
			branch.addObserver("", this, false);
			branch.getChildList("",
			{}).forEach( function(name)
			{
				func(branch, name);
			});
		};
	
		this.unregister = function unregister()
		{
			if (branch)
				branch.removeObserver("", this);
		};
	
		this.observe = function(subject, topic, data)
		{
			if (topic == "nsPref:changed")
				func(branch, data);
		};
	};
	
	
	// Initialization
	this.initialize = function() 
	{
	    for (var i=0; i<namespaces.length; i+=2) 
	    {
	        var fn = namespaces[i];
	
	        var ns = namespaces[i+1];
	        fn.apply(ns);
	    }
	    
	    // Noojee Click specific initialisation
		var myListener = new PrefListener("extensions.noojeeclick.", function(branch, name)
		{
			switch (name)
			{
				case "pattern":
					noojeeClick.onRefresh();
					break;
			}
		});
		myListener.register();

		// Hook the page load event
		var appcontent = window.document.getElementById("appcontent");
		if (appcontent != undefined && appcontent != null)
			appcontent.addEventListener("DOMContentLoaded", noojeeClick.onPageLoad, false);

		// Add a context menu handler so we can dynamically show/hide specific menu items.
		var contextMenu = document.getElementById("contentAreaContextMenu");
		if (contextMenu)
			contextMenu.addEventListener("popupshowing", noojeeClick.showMenuHideItems, false);
	};
	
	
	// Clean up
	this.shutdown = function() 
	{
	    window.removeEventListener("load", noojeeClick.initialize, false);
	    window.removeEventListener("unload", noojeeClick.shutdown, false);
	};
	
	
	/*
	 * This method doesn't really belong here, unfortunately this method is used
	 * from configuration.xul and configuration.xul doesn't like initialising the
	 * name space. I believe that a xul windows is just like another browser
	 * instance and so the namespace has to be loaded.
	 * My best guess is that the eventListeners (at the bottom of this class)
	 * aren't being called.
	 */ 
	this.onConfigurationLoad = function ()
	{
	
		// Check if we need to disable the asterisk tab 
	 	if (this.getBoolValue("tab.asterisk.enabled") == false)
	 	{
	 		this.ns_debug("init", "asterisk tab disabled");
	  		var tabBox = window.document.getElementById('njConfigTabbox');
	 		var asteriskTab = tabBox.tabs.getItemAtIndex(3);
	  		asteriskTab.disabled = true;
	 		asteriskTab.collapsed = true;
	 	}	
	 	else
	 		this.ns_debug("init", "asterisk tab enabled");
	};
	
	/* Used to support the above function onConfigurationLoad.
	 * This method is an intentional duplication of noojeeClick.util.getBoolValue
	 */
	this.getBoolValue = function (key)
	{
		try
		{
			var value = null;
			var prefObj = Components.classes["@mozilla.org/preferences-service;1"]
			        .getService(Components.interfaces.nsIPrefService);
			var Branch = prefObj.getBranch("extensions.noojeeclick.");
			var defaultBranch = prefObj.getDefaultBranch("extensions.noojeeclick.");
			value = Branch.getBoolPref(key);
		}
		catch (e)
		{
			// ignored as just means that key doesn't exist.
		}

		return value;
	};

	// duplicate of njdebug so we can still output debug messages during initilisation.
	// We can't call the normal njdebug until the namespaces are all setup.	
	this.ns_debug = function (module, msg)
	{
	
		if (this.getBoolValue("enableDebugging") == true)
		{
			var filter = this.getValue("debugFilter");
	
			if (filter.search(module, "i") >= 0)
			{
				var now = new Date();
				var hour = now.getHours();
				var min = now.getMinutes();
				var sec = now.getSeconds();
				var mil = now.getMilliseconds();
				this.consoleService.logStringMessage(hour + ":" + min + ":" + sec + ":" + mil+ " debug (" + module + "): " + msg);
			}
		}
	};
	
	this.getValue = function (key)
	{
		try
		{
			var value = null;
			var prefObj = Components.classes["@mozilla.org/preferences-service;1"]
			        .getService(Components.interfaces.nsIPrefService);
			var Branch = prefObj.getBranch("extensions.noojeeclick.");
			value = Branch.getCharPref(key);
		}
		catch (e)
		{
			// ignored as it probably means that this preference hasn't been set.
		}
		return value;
	};
	
	
	// Register handlers to maintain extension life cycle.
	window.addEventListener("load", noojeeClick.initialize, false);
	window.addEventListener("unload", noojeeClick.shutdown, false);
	
}).apply(noojeeClick);


