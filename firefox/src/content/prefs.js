
noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.prefs =
{

		// constants
		CONST_IMG_CALLPHONE:  "chrome://noojeeclick/content/images/call-phone.png",

  

onConfiguration: function (e)
{
	var features = "chrome,titlebar,toolbar,centerscreen,modal";
	window.openDialog("chrome://noojeeclick/content/xul/configuration.xul", "Preferences", features);

	theApp.render.onRefresh();
	// force a fresh login in case the asterisk settings changed.
	if (theApp.asterisk.getInstance() != null)
		theApp.asterisk.getInstance().setLoggedIn(false);
	return true;
},

onTestConnection: function ()
{
	var features = "chrome,titlebar,toolbar,centerscreen,modal";

	window.openDialog("chrome://noojeeclick/content/xul/diagnose.xul", "Diagnose", features);
},


getValue: function (key)
{
	var value = null;
	try
	{
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
},

getBoolValue: function (key)
{
	var value = null;
	try
	{
		var prefObj = Components.classes["@mozilla.org/preferences-service;1"]
		        .getService(Components.interfaces.nsIPrefService);
		var Branch = prefObj.getBranch("extensions.noojeeclick.");
		value = Branch.getBoolPref(key);
	}
	catch (e)
	{
		// ignored as just means that key doesn't exist.
	}

	return value;
},

setValue: function (key, value)
{
	var prefObj = Components.classes["@mozilla.org/preferences-service;1"]
	        .getService(Components.interfaces.nsIPrefService);
	var Branch = prefObj.getBranch("extensions.noojeeclick.");

	if (typeof value == 'boolean')
		Branch.setBoolPref(key, value);
	else
		Branch.setCharPref(key, value);
},

/*
 * set a boolean noojee click preference.
 */
setBoolValue: function (key, value)
{
	var prefObj = Components.classes["@mozilla.org/preferences-service;1"]
	        .getService(Components.interfaces.nsIPrefService);
	var Branch = prefObj.getBranch("extensions.noojeeclick.");

	Branch.setBoolPref(key, value);
},

getUsername : function()
{
	return noojeeClick.getUsername();
},

getPassword : function(username)
{
	return noojeeClick.retrieveCredentials(theApp.prefs.getValue("host"), username);
},




};

}});