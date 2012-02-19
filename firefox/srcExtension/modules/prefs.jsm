var EXPORTED_SYMBOLS = ["getBoolValue", "getValue", "getValues", "prefListener", "setValue"];

Components.utils.import("resource://noojeeclick/asterisk.jsm");
Components.utils.import("resource://noojeeclick/prompts.jsm");


/*

var EXPORTED_SYMBOLS = ["onConfiguration"
 , "onTestConnection", "getValue", 
 , "getBoolValue", "setValue"
 , "setBoolValue"
 , "prefListener"];

*/

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
		 * prompt.exception("getValue", e);
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
