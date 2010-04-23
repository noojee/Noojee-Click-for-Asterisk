var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);



function onConfigurationClosed()
{
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
