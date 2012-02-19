
noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.prefs =
{

passwordManager: Components.classes["@mozilla.org/login-manager;1"]
	.getService(Components.interfaces.nsIPrefService);

nsLoginInfo: new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",  
                                              Components.interfaces.nsILoginInfo,  
                                              "init");  
nsLoginManager: Components.classes["@mozilla.org/login-manager;1"].  
                           getService(Components.interfaces.nsILoginManager);  

url: "chrome://noojeeclick";
  

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
},

getBoolValue: function (key)
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

getCredentials: function (hostname, username)
{
    // Find users for the given parameters  
    var logins = myLoginManager.findLogins({}, hostname, formSubmitURL, httprealm);  
         
    var password = "";
    
    // Find user from returned array of nsILoginInfo objects  
    for (var i = 0; i < logins.length; i++) 
    {  
       if (logins[i].username == username) 
       {  
          password = logins[i].password;  
          break;  
       }  
    } 
    return password;
}


getUsername: function ()
{
	return theApp.prefs.getValue("username");
},

//getPassword: function()
//{
//	return theApp.prefs.getValue("password"); 
//},

storeCredentials: function(host, username, password)
{
	var extLoginInfo = new nsLoginInfo(url,  
                       null, 'Asterisk Auth',  
                       username, password, "", "");
    myLoginManager.removeLogin(loginInfo); 
	myLoginManager.addLogin(loginInfo);  
}

}});