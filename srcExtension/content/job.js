noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.job =
{

// The Dial Job
Dial: function ()
{
	
	this.run = function(sequence, phoneNo)
	{
		var normalised = theApp.phonepatterns.normalisePhoneNo(phoneNo);
		var extension = theApp.prefs.getValue("extension");
		var context = theApp.prefs.getValue("context");
		var handsetType = theApp.prefs.getValue("handsetType");
		
		theApp.noojeeclick.showHangupIcon();

		if (extension == null)
		{
			theApp.prompts.njAlert("Please enter your extension via the configuration panel first.");
			return;
		}

		if (context == null)
		{
			theApp.prompts.njAlert("Please enter the context via the configuration panel first.");
			return;
		}

		// If no tech specified then add SIP/ otherwise use the selected tech.
		var channel = "&Channel=";
		if (extension.indexOf("/") == -1)
		{
			channel += "SIP/" + extension;
		}
		else
		{
			channel += extension;
		}

		theApp.util.njdebug("job", "Channel=" + channel);

		// dial
		var url = theApp.job.genURL("Originate");
		url += channel;
		url += "&Exten=" + normalised;
		url += "&Context=" + context;
		// The next two variables are set to display the number that
		// is being dialled on the local handset's LCD.
		// The CallerId must only contain numbers as the likes of trixbox
		// will drop the call if it contains non-digits.
		// The CALLERID(Name) is set for sip phones that can display text (I think this might work)
		// 
		url += "&Variable=CALLERID(Num)=" + normalised; // Hopefully sets the handsets display 
		url += "&Variable=CALLERID(Name)=" + phoneNo + "-NoojeeClick";  //and this as well.

		// If the user has configured the callerId then lets set it.
		// We try to control the callerID that is presented to the 
		// far end by setting CALLERID(Num).
		var callerID = theApp.prefs.getValue("callerId");
		if (callerID != null)
		{
			url += "&CallerId=" + callerID;
		}
		else 
			url += "&CallerId=" + normalised; // no caller id so we like to display the number we dialling
												// on the users handset.

		theApp.util.njdebug("job", "url=" + url);

		// Get the auto answer header if there is one
		var enableAutoAnswer = theApp.prefs.getBoolValue("enableAutoAnswer");
		theApp.util.njdebug("job", "AutoAnswer=" + enableAutoAnswer + " handsetType=" + handsetType);
		if (enableAutoAnswer)
		{
			var i = 0;
			for (i = 0; i < theApp.noojeeclick.autoAnswerList.length; i++)
			{
				theApp.util.njdebug("job", "manufacturer(i)=" + theApp.noojeeclick.autoAnswerList[i].manufacturer);
				if (handsetType == theApp.noojeeclick.autoAnswerList[i].manufacturer)
				{
					url += "&Variable=" + "SIPAddHeader=" + theApp.noojeeclick.autoAnswerList[i].header;
					break;
				}
			}
		}

		url += "&Priority=1";

		theApp.util.njdebug("job", "Dialing");

		this.status = function()
		{
			theApp.util.njlog("Dialing: " + phoneNo + " (" + normalised + ")");
		}

		theApp.dialstatus.getInstance().updateStatus("Dialing: " + phoneNo);
		theApp.util.njdebug("job", "dialurl=" + url);
		sequence.request(url);
	}

	this.handleResponse = function(result)
	{
		var abort = false;
		var authRequired = false;
		if (result.response != "Success")
		{
			theApp.util.njlog("Dial Failed");
			theApp.asterisk.getInstance().updateState("");
			theApp.noojeeclick.resetIcon();
			if (result.message == "Authentication Required")
			{
				theApp.dialstatus.getInstance().updateStatus("The connection to Asterisk was lost.");
		
				var sequence = new theApp.sequence.Sequence( [ new Login(), new Wait(null) ], "", false);
				sequence.run();
			}
			else if (result.message.indexOf("Permission denied") == 0)
			{
				theApp.asterisk.getInstance().setLoggedIn(false);
				if (result.message == "Permission denied: please login first.")
				{
					theApp.util.showError(result.response, "Invalid Username/Password. Please check your Noojee Click configuration against manager.conf.");
				}
				else
					theApp.util.showError(result.response, "Permission Denied, please check the read/write options in manager.conf.");
			}
			else
			{
				// If we are nolonger in a local dial, then we don't 
				// care that the dial failed.
				// This can happen if the user hangs up a call just after
				// starting to dial it.
				if (theApp.asterisk.getInstance().isLocalDialInProgress())
					theApp.util.showError(result.response, "Dial failed: " + result.message);
			}
			
			abort = true;
		}
		return abort;
	}

	this.doContinue = function()
	{
		return false;
	}
	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	}
},

//The Answer Job
Answer: function (channel)
{
	this.channel = channel;
	
	this.run = function(sequence, phoneNo)
	{
		var normalised = theApp.phonepatterns.normalisePhoneNo(phoneNo);
		var extension = theApp.prefs.getValue("extension");
		var context = theApp.prefs.getValue("context");
		var handsetType = theApp.prefs.getValue("handsetType");
		
		theApp.noojeeclick.showHangupIcon();

		if (extension == null)
		{
			theApp.prompts.njAlert("Please enter your extension via the configuration panel first.");
			return;
		}

		if (context == null)
		{
			theApp.prompts.njAlert("Please enter the context via the configuration panel first.");
			return;
		}

		// If no tech specified then add SIP/ otherwise use the selected tech.
		var localChannel = "&Channel=";
		if (extension.indexOf("/") == -1)
		{
			localChannel += "SIP/" + extension;
		}
		else
		{
			localChannel += extension;
		}

		theApp.util.njdebug("job", "LocalChannel=" + localChannel);

		var callerID = theApp.prefs.getValue("callerID");


		
		// dial
		var url = theApp.job.genURL("Redirect");
		url += localChannel;
		url += "&Exten=" + this.channel;
		url += "&Context=" + context;
		url += "&CallerId=" + phoneNo; // + "-NoojeeClick";
	
		theApp.util.njdebug("job", "url=" + url);

		// Get the auto answer header if there is one
		enableAutoAnswer = theApp.prefs.getBoolValue("enableAutoAnswer");
		theApp.util.njdebug("job", "AutoAnswer=" + enableAutoAnswer + " handsetType=" + handsetType);
		if (enableAutoAnswer)
		{
			var i = 0;
			for (i = 0; i < theApp.noojeeclick.autoAnswerList.length; i++)
			{
				theApp.util.njdebug("job", "manufacturer(i)=" + theApp.noojeeclick.autoAnswerList[i].manufacturer);
				if (handsetType == theApp.noojeeclick.autoAnswerList[i].manufacturer)
				{
					url += "&Variable=" + "SIPAddHeader=" + theApp.noojeeclick.autoAnswerList[i].header;
					break;
				}
			}
		}

		url += "&Priority=1";

		theApp.util.njdebug("job", "Answering");

		this.status = function()
		{
			theApp.util.njlog("Answering: " + phoneNo + " (" + normalised + ")");
		}

		theApp.dialstatus.getInstance().updateStatus("Answering: " + phoneNo);
		theApp.util.njdebug("job", "answerurl=" + url);
		sequence.request(url);
	}

	this.handleResponse = function(result)
	{
		var abort = false;
		authRequired = false;
		if (result.response != "Success")
		{
			theApp.util.njlog("Answer Failed");
			theApp.asterisk.getInstance().updateState("");
			theApp.noojeeclick.resetIcon();
			if (result.message == "Authentication Required")
			{
				theApp.dialstatus.getInstance().updateStatus("The connection to Asterisk was lost.");
		
				var sequence = new theApp.sequence.Sequence( [ new this.Login(), new this.Wait(null) ], "", false);
				sequence.run();
			}
			else if (result.message.indexOf("Permission denied") == 0)
			{
				theApp.asterisk.getInstance().setLoggedIn(false);
				if (result.message == "Permission denied: please login first.")
				{
					theApp.util.showError(result.response, "Invalid Username/Password. Please check your Noojee Click configuration against manager.conf.");
				}
				else
					theApp.util.showError(result.response, "Permission Denied, please check the read/write options in manager.conf.");
			}
			else
			{
				// If we are nolonger in a local dial, then we don't 
				// care that the dial failed.
				// This can happen if the user hangs up a call just after
				// starting to dial it.
				if (theApp.asterisk.getInstance().isLocalDialInProgress())
					theApp.util.showError(result.response, "Dial failed: " + result.message);
			}
			
			abort = true;
		}
		return abort;
	}

	this.doContinue = function()
	{
		return false;
	}
	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	}
},


// Wait Job
Wait: function (subSequence)
{
	this.ranOnce = false;
	this.subSequence = subSequence;

	this.run = function(sequence, param)
	{
		// Start monitoring events
		var url = theApp.job.genURL("WaitEvent");
		// The first time through we want wait to return immediately so we can
		// start the subSequence
		if (this.ranOnce == false && this.subSequence != null)
			url += "&Timeout=1";
		else
			url += "&Timeout=30";

		theApp.util.njdebug("job", "url=" + url);

		theApp.util.njdebug("job", "starting event monitoring");

		this.status = function()
		{
			theApp.util.njlog("WaitEvent: event monitoring initialised.");
		}

		theApp.util.njdebug("job", "waitEventurl=" + url);
		sequence.request(url);
	}

	this.doContinue = function()
	{
		return true;
	}
	
	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	}
	
	this.handleResponse = function(result)
	{
		var abort = false;

		theApp.util.njdebug("job", "waitEvent has returned, result=" + result);
		if (result.response != "Success")
		{
			theApp.util.showError(result.response, result.message);
			abort = true;
		}
		else
		{
			// the wait job is designed to monitor a sub sequence
			// so now that the wait job is running start the sub sequence.
			if (this.ranOnce == false)
			{
				this.ranOnce = true;
				if (this.subSequence != null)
					this.subSequence.run(this.subSequence, this.subSequence.param);
			}

			// Now process the event
			// responseText=<ajax-response>
			// <response type='object' id='unknown'><generic response='Success'
			// message='Waiting for Event...' /></response>
			// <response type='object' id='unknown'><generic event='Newchannel'
			// privilege='call,all' channel='SIP/115-08239ca8' state='Down'
			// calleridnum='&lt;unknown&gt;' calleridname='&lt;unknown&gt;'
			// uniqueid='1224888384.18' /></response>
			// <response type='object' id='unknown'><generic
			// event='WaitEventComplete' /></response>
			// </ajax-response>
		}
		return abort;
	}
	
	this.error = function(responseText)
	{
		theApp.noojeeclick.resetIcon();
		theApp.asterisk.getInstance().updateState("");
		
		if (responseText == null || responseText.length == 0)
		{
			theApp.util.njlog("Unexpected error responseText is empty, asterisk may be down.");
			theApp.util.showError(responseText, "Unable to connect to Asterisk.");
		}
		else
		{
			var result = parseResponse(details.responseText);
			theApp.util.njlog("Action failed " + result.message);
			theApp.util.showError(result.response, result.message);
		}
	}

},

HangupAction: function (channel)
{
	this.channel = channel;
	
	this.run = function(sequence, dummy)
	{
		var extension = theApp.prefs.getValue("extension");
		var context = theApp.prefs.getValue("context");

		theApp.asterisk.getInstance().updateState("");
		theApp.noojeeclick.resetIcon();

		if (extension == null)
		{
			theApp.prompts.njAlert("Please enter your extension via the configuration panel first.");
			return;
		}

		if (context == null)
		{
			theApp.prompts.njAlert("Please enter the context via the configuration panel first.");
			return;
		}

		// If no tech specified then add SIP/ otherwise use the selected tech.
		var channel = "&Channel=" + this.channel;

		theApp.util.njdebug("job", "hangup channel=" + this.channel);

		// dial
		var url = theApp.job.genURL("Hangup");
		url += channel;
		url += "&Context=" + context;

		theApp.util.njdebug("job", "url=" + url);

		url += "&Priority=1";

		theApp.util.njdebug("job", "Hangup");

		this.status = function()
		{
			theApp.util.njlog("Hangup: " + extension);
		}

		//theApp.dialstatus.getInstance().updateStatus("Hangup: " + extension);
		theApp.util.njdebug("job", "hangup url=" + url);
		sequence.request(url);
	}

	this.doContinue = function()
	{
		return false;
	}

	this.handleResponse = function(result)
	{
		var abort = false;
		if (result.response != "Success")
		{
			theApp.util.showError(result.response, result.message);
			abort = true;
		}
		
		// We have now hungup so make certain the status line
		// is clear.
		theApp.asterisk.getInstance().updateState("Disconnecting");
		theApp.noojeeclick.resetIcon();
		window.setTimeout("noojeeClick.asterisk.getInstance().updateState('');", 3000);
		
		return abort;
	}


	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	}
	
},

// Ping Job
Ping: function ()
{
	this.run = function(sequence, param)
	{
		theApp.util.njlog("ping");
		// ping
		var url = theApp.job.genURL("Ping");

		this.status = function()
		{
			theApp.util.njlog("Pinging");
		}

		sequence.request(url);
	}

	this.doContinue = function()
	{
		return false;
	}

	this.handleResponse = function(result)
	{
		var abort = false;
		if (result.response != "Success")
		{
			theApp.util.showError(result.response, result.message);
			abort = true;
		}
		return abort;
	}

	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	}
	
},

// Status Job
Status: function ()
{
	this.run = function(sequence, param)
	{
		theApp.util.njlog("status");
		// status
		var url = theApp.job.genURL("Status");

		this.status = function()
		{
			theApp.util.njlog("Checking Asterisk Status");
		}

		sequence.request(url);
	}

	this.doContinue = function()
	{
		return false;
	}

	this.handleResponse = function(result)
	{
		var abort = false;
		if (result.response != "Success")
		{
			theApp.util.showError(result.response, result.message);
			abort = true;
		}
		return abort;
	}

	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	}
	
},

// Complete Job
Complete: function ()
{
	this.run = function(sequence, param)
	{
		theApp.util.njdebug("job", "compete");
		// status
		this.status = function()
		{
			theApp.util.njdebug("job", "Checking Asterisk Status");
		}

		//theApp.dialstatus.getInstance().updateStatus("Dialed: " + param);
	}

	this.doContinue = function()
	{
		return false;
	}

	this.handleResponse = function(result)
	{
		var abort = false;
		if (result.response != "Success")
		{
			theApp.util.showError(result.response, result.message);
			abort = true;
		}
		return abort;
	}

	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	}
	
},

// Login Job
Login: function ()
{
	this.run = function(sequence, phoneNo)
	{
		theApp.util.njdebug("job", "login");
		var url = theApp.job.genURL("Login");
		var username = noojeeClick.getUsername();
		var password = noojeeClick.retrieveCredentials(theApp.prefs.getValue("host"), username);
		theApp.asterisk.getInstance().setLoggedIn(false);
		
		theApp.util.njdebug("job", "Username: " + username);
		url += "&Username=" + username;
		url += "&Secret=" + password;
		url += "&Events=call";

		this.status = function()
		{
			theApp.util.njlog("Authenticating");
		}

		// theApp.dialstatus.getInstance().updateStatus("Authenticating");

		sequence.request(url);
	}

	this.doContinue = function()
	{
		return false;
	}

	this.handleResponse = function(result)
	{
		var abort = false;
		if (result.response != "Success")
		{
			theApp.asterisk.getInstance().setLoggedIn(false);
			theApp.util.showError(result.response, result.message);
			abort = true;
		}
		else
		{
			theApp.asterisk.getInstance().setLoggedIn(true);
			theApp.util.njlog("Login completed.");
		}
		return abort;
	}

	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	}
	
},

// Logoff Job
Logoff: function ()
{
	this.run = function(sequence, phoneNo)
	{
		var url = theApp.job.genURL("Logoff");
		theApp.asterisk.getInstance().setLoggedIn(false);

		this.status = function()
		{
			theApp.util.njlog("Logging off");
		}

		theApp.dialstatus.getInstance().updateStatus("Logging Off");
		sequence.request(url);

	}

	this.doContinue = function()
	{
		return false;
	}

	this.handleResponse = function(result)
	{
		var abort = false;
		if (result.response != "Success")
		{
			theApp.util.showError(result.response, result.message);
			abort = true;
		}
		return abort;
	}

	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	}
	
},

// Returns the url to execute when the user clicks on the url
genURL: function (command)
{
	theApp.util.njdebug("job", "genURL(command)=" + command);
	var url;

	var protocol = "http://";
	
	var useHTTPS = theApp.prefs.getBoolValue("useHttps");
	if (useHTTPS == true)
		protocol = "https://";
	
	var host = theApp.prefs.getValue("host");
	var port = theApp.prefs.getValue("port");
	var serverType = theApp.prefs.getValue("serverType");
	var httpPrefix = theApp.prefs.getValue("httpPrefix");
	// The asterisk appliance doesn't allow a prefix so we need to support a null prefix
	if (httpPrefix == null || theApp.util.trim(httpPrefix).length == 0)
		httpPrefix = "/";
	else
		httpPrefix = "/" + theApp.util.trim(httpPrefix) + "/";
	theApp.util.njdebug("job", "serverType=" + serverType);
	if (serverType == theApp.noojeeclick.serverTypeList[0].type)
		url = protocol + host + ":" + port + httpPrefix + "manager?action=" + command;
	else if (serverType == theApp.noojeeclick.serverTypeList[1].type)
		url = protocol + host + ":" + port + httpPrefix + "mxml?action=" + command;
	else
	{
		theApp.util.njlog("Error: Unknown server type selected =" + serverType);
		theApp.prompts.njAlert("Unknown server type selected =" + serverType);
	}

	theApp.util.njdebug("job", "genURL ret=" + url);
	return url;
}



}

}});