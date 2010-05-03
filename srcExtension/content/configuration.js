var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);


/*
 * Called when the configuration dialog box is loaded.
 */
function onConfigurationLoad()
{
	njdebug("config", "onConfigurationLoad called");
	
	
	/* Check if we need to disable the asterisk tab */
 	if (getBoolValue("tab.asterisk.enabled") == false)
 	{
 		njdebug("config", "asterisk tab disabled");
  		var tabBox = window.document.getElementById('njConfigTabbox')
 		var asteriskTab = tabBox.tabs.getItemAtIndex(3);
  		asteriskTab.disabled = true;
 		asteriskTab.collapsed = true;
 	}	
 	else
 		njdebug("config", "asterisk tab enabled");
}

function onConfigurationClosed()
{
	njdebug("config", "onConfigurationClosed called");
    return false;
}


//function log(msg)
//{
//	if (loggingEnabled == true)
//	{
//		var now = new Date();
//		var hour = now.getHours();
//		var min = now.getMinutes();
//		var sec = now.getSeconds();
//		//Components.utils.reportError(hour + ":" + min + ":" + sec + " " + msg);
//        consoleService.logStringMessage(hour + ":" + min + ":" + sec + " " + msg);
//
//		
//	}
//}
