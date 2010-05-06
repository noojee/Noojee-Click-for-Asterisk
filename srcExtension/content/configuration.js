function onConfigurationLoad()
{
	noojeeClick.util.njdebug("config", "onConfigurationLoad called");
	
	
	// Check if we need to disable the asterisk tab 
 	if (theApp.prefs.getBoolValue("tab.asterisk.enabled") == false)
 	{
 		theApp.util.njdebug("config", "asterisk tab disabled");
  		var tabBox = window.document.getElementById('njConfigTabbox');
 		var asteriskTab = tabBox.tabs.getItemAtIndex(3);
  		asteriskTab.disabled = true;
 		asteriskTab.collapsed = true;
 	}	
 	else
 		theApp.util.njdebug("config", "asterisk tab enabled");
}


noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.configuration =
{

/*
onConfigurationClosed: function ()
{
	theApp.util.njdebug("config", "onConfigurationClosed called");
    return false;
}
*/

}

}});