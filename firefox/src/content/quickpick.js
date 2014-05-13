noojeeClick.ns(function() 
{
	with (noojeeClick.LIB) 
	{
	
		theApp.quickpicks =
		{
		
			reloadQuickPicks : function()
			{
				setBoolValue("clidquickpick.reload", true);
			},
			
			retrieveQuickPicks : function()
			{
				if (getBoolValue("clidquickpick.reload"))
				{
					setBoolValue("clidquickpick.reload", false);
					var quickPickUrl = getValue("clidquickpick.url");
			
					ns_debug("quickpicks", "retrieving CLID quickpicks: url=" + quickPickUrl);
					var xmlhttp;
					xmlhttp = new XMLHttpRequest();
			
					// setup the call back handler
					xmlhttp.onreadystatechange = function()
					{
						try
						{
							ns_debug("quickpicks", "readstate changed state=" + xmlhttp.readyState);
			
							if (xmlhttp.readyState == 4)
							{
								if (xmlhttp.status == 200)
								{
									// We have a success so lets load the pick list and
									// save
									// it to properties.
			
									var xmlResponse = xmlhttp.responseXML;
									ns_debug("quickpicks", "quickpicks recieved: data=" + xmlResponse);
			
									var quickPicks = xmlResponse.getElementsByTagName('clid-quick-pick');
			
									var count = quickPicks.length;
									ns_debug("quickpicks", "quickpicks count: " + count);
									setValue("clidquickpick.count", count);
			
									for ( var i = 0; i < count; i++)
									{
										var name = quickPicks[i].getAttribute("name");
										var clid = quickPicks[i].getAttribute("clid");
			
										ns_debug("quickpicks", "received quickpick: " + name + ", " + clid);
										setValue("clidquickpick.pick-" + i + "-name", name);
										setValue("clidquickpick.pick-" + i + "-clid", clid);
									}
								}
								else
								{
									ns_debug("quickpicks", "An error occured attempting to retrieve the CLID Quick Pick list. " + xmlhttp.responseXML);
								}
			
								ns_debug("quickpicks", "exiting state=" + xmlhttp.readyState);
								// Flag that the menu needs to be reloaded.
								setBoolValue("clidquickpick.reset", "true");
							}
						} catch (e)
						{
							ns_debug("quickpicks", "exception " + e);
						}
					};
			
					ns_debug("quickpicks", "calling open on url");
					xmlhttp.open("GET", quickPickUrl, true);
			
					// xmlhttp.open("GET", quickPickUrl + ((/\?/).test(url) ? "&" : "?")
					// +
					// (new Date()).getTime(), true);
					// xmlhttp.withCredentials = "true";
					ns_debug("quickpicks", "calling send on url");
					xmlhttp.send();
					ns_debug("quickpicks", "calling send complete");
				}
			};
		
		
		};

}});