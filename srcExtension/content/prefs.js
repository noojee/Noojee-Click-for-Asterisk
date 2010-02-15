function onConfiguration(e)
{
	var features = "chrome,titlebar,toolbar,centerscreen,modal";
	window.openDialog("chrome://noojeeclick/content/xul/configuration.xul", "Preferences", features);

	onRefresh();
	// force a fresh login in case the asterisk settings changed.
	if (gAsterisk != null)
		gAsterisk.setLoggedIn(false);
	return true;
}

function onTestConnection()
{
	var features = "chrome,titlebar,toolbar,centerscreen,modal";

	window.openDialog("chrome://noojeeclick/content/xul/diagnose.xul", "Diagnose", features);
}


function getValue(key)
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
		/*
		 * if (e.number == 0x8000ffff) value = null; else
		 * showException("getValue", e);
		 */
	}
	return value;
}

function getBoolValue(key)
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
}

function setValue(key, value)
{
	var prefObj = Components.classes["@mozilla.org/preferences-service;1"]
	        .getService(Components.interfaces.nsIPrefService);
	var Branch = prefObj.getBranch("extensions.noojeeclick.");

	if (typeof value == 'boolean')
		Branch.setBoolPref(key, value);
	else
		Branch.setCharPref(key, value);
}

/*
 * set a boolean noojee click preference. 
 */
function setBoolValue(key, value)
{
	var prefObj = Components.classes["@mozilla.org/preferences-service;1"]
	        .getService(Components.interfaces.nsIPrefService);
	var Branch = prefObj.getBranch("extensions.noojeeclick.");

	Branch.setBoolPref(key, value);
}


/* retrieve a all of our preference values and cache them.
 * 
 */
function getValues()
{
	try
	{
		var prefObj = Components.classes["@mozilla.org/preferences-service;1"]
		        .getService(Components.interfaces.nsIPrefService);
		var Branch = prefObj.getBranch("extensions.noojeeclick.");

		Enabled = getBoolValue("enabled");

		initialised = getBoolValue("initialised");
		if (initialised == null)
			initialised = false;

		serverType = Branch.getCharPref("serverType");
		if (serverType == null)
			serverType = serverTypeList[0].type;

		host = Branch.getCharPref("host");

		port = Branch.getCharPref("port");
		if (port == null)
			port = "80";

		username = Branch.getCharPref("username");

		password = Branch.getCharPref("password");

		extension = Branch.getCharPref("extension");
		context = Branch.getCharPref("context");
		if (context == null)
		{
			njlog("No context found using 'default'");
			context = "default";
		}

		dialPrefix = Branch.getCharPref("dialPrefix");
		if (dialPrefix == null)
			dialPrefix = "";

		internationalPrefix = Branch.getCharPref("internationalPrefix");
		if (internationalPrefix == null)
			internationalPrefix = "";

		pattern = Branch.getCharPref("pattern");
		if (pattern == null)
			pattern = "";

		enableAutoAnswer = getBoolValue("enableAutoAnswer", false);
		if (enableAutoAnswer == null)
			enableAutoAnswer = false;

		handsetType = Branch.getCharPref("handsetType", autoAnswerList[0].manufacturer);
		if (handsetType == null)
			handsetType = autoAnswerList[0].manufacturer;
		njdebug("prefs", "getting handsetType:" + handsetType);

		loggingEnabled = getBoolValue("enableLogging", false);
		if (loggingEnabled == null)
			loggingEnabled = false;

		njdebug("prefs", "loggingEnabled =" + loggingEnabled);
	}
	catch (exception)
	{
		showException("getValues", exception);
	}

	return true;
}

function prefListener(branchName, func)
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
}
