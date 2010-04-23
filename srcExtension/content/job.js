// The Dial Job
function Dial()
{
	
	this.run = function(sequence, phoneNo)
	{
		var normalised = normalisePhoneNo(phoneNo);
		extension = getValue("extension");
		context = getValue("context");
		handsetType = getValue("handsetType");
		
		showHangupIcon();

		if (extension == null)
		{
			njAlert("Please enter your extension via the configuration panel first.");
			return;
		}

		if (context == null)
		{
			njAlert("Please enter the context via the configuration panel first.");
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

		njdebug("job", "Channel=" + channel);

		// dial
		var url = genURL("Originate");
		url += channel;
		url += "&Exten=" + normalised;
		url += "&Context=" + context;
		// The next two variables are set to display the number that
		// is being dialled on the local handset's LCD.
		// The CallerId must only contain numbers as the likes of trixbox
		// will drop the call if it contains non-digits.
		// The CallerID(Name) is set for sip phones that can display text (I think this might work)
		// 
		url += "&Variable=CallerID(Num)=" + normalised; // Hopefully sets the handsets display 
		url += "&Variable=CallerID(Name)=" + phoneNo + "-NoojeeClick";  //and this as well.

		// If the user has configured the callerId then lets set it.
		// We try to control the callerID that is presented to the 
		// far end by setting CallerID(Num).
		var callerID = getValue("callerId");
		if (callerID != null)
		{
			url += "&CallerId=" + callerID;
		}
		else 
			url += "&CallerId=" + normalised; // no caller id so we like to display the number we dialling
												// on the users handset.

		njdebug("job", "url=" + url);

		// Get the auto answer header if there is one
		enableAutoAnswer = getBoolValue("enableAutoAnswer");
		njdebug("job", "AutoAnswer=" + enableAutoAnswer + " handsetType=" + handsetType);
		if (enableAutoAnswer)
		{
			var i = 0;
			for (i = 0; i < autoAnswerList.length; i++)
			{
				njdebug("job", "manufacturer(i)=" + autoAnswerList[i].manufacturer);
				if (handsetType == autoAnswerList[i].manufacturer)
				{
					url += "&Variable=" + "SIPAddHeader=" + autoAnswerList[i].header;
					break;
				}
			}
		}

		url += "&Priority=1";

		njdebug("job", "Dialing");

		this.status = function()
		{
			njlog("Dialing: " + phoneNo + " (" + normalised + ")");
		}

		getStatusWindow().updateStatus("Dialing: " + phoneNo);
		njdebug("job", "dialurl=" + url);
		sequence.request(url);
	}

	this.handleResponse = function(result)
	{
		var abort = false;
		authRequired = false;
		if (result.response != "Success")
		{
			njlog("Dial Failed");
			gAsterisk.updateState("");
			resetIcon();
			if (result.message == "Authentication Required")
			{
				showError(result.response, "The connection to Asterisk was lost, a reconnect will be initiated. Wait a moment and then dial again.");
		
				var sequence = new Sequence( [ new Login(), new Wait(null) ], "", false);
				sequence.run();
			}
			else if (result.message.indexOf("Permission denied") == 0)
			{
				gAsterisk.setLoggedIn(false);
				if (result.message == "Permission denied: please login first.")
				{
					showError(result.response, "Invalid Username/Password. Please check your Noojee Click configuration against manager.conf.");
				}
				else
					showError(result.response, "Permission Denied, please check the read/write options in manager.conf.");
			}
			else
			{
				// If we are nolonger in a local dial, then we don't 
				// care that the dial failed.
				// This can happen if the user hangs up a call just after
				// starting to dial it.
				if (gAsterisk.isLocalDialInProgress())
					showError(result.response, "Dial failed: " + result.message);
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
		return gAsterisk.parseResponse(responseText);
	}
}

//The Answer Job
function Answer(channel)
{
	this.channel = channel;
	
	this.run = function(sequence, phoneNo)
	{
		var normalised = normalisePhoneNo(phoneNo);
		extension = getValue("extension");
		context = getValue("context");
		handsetType = getValue("handsetType");
		
		showHangupIcon();

		if (extension == null)
		{
			njAlert("Please enter your extension via the configuration panel first.");
			return;
		}

		if (context == null)
		{
			njAlert("Please enter the context via the configuration panel first.");
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

		njdebug("job", "LocalChannel=" + localChannel);

		var callerID = getValue("callerID");


		
		// dial
		var url = genURL("Redirect");
		url += localChannel;
		url += "&Exten=" + this.channel;
		url += "&Context=" + context;
		url += "&CallerId=" + phoneNo; // + "-NoojeeClick";
	
		njdebug("job", "url=" + url);

		// Get the auto answer header if there is one
		enableAutoAnswer = getBoolValue("enableAutoAnswer");
		njdebug("job", "AutoAnswer=" + enableAutoAnswer + " handsetType=" + handsetType);
		if (enableAutoAnswer)
		{
			var i = 0;
			for (i = 0; i < autoAnswerList.length; i++)
			{
				njdebug("job", "manufacturer(i)=" + autoAnswerList[i].manufacturer);
				if (handsetType == autoAnswerList[i].manufacturer)
				{
					url += "&Variable=" + "SIPAddHeader=" + autoAnswerList[i].header;
					break;
				}
			}
		}

		url += "&Priority=1";

		njdebug("job", "Answering");

		this.status = function()
		{
			njlog("Answering: " + phoneNo + " (" + normalised + ")");
		}

		getStatusWindow().updateStatus("Answering: " + phoneNo);
		njdebug("job", "answerurl=" + url);
		sequence.request(url);
	}

	this.handleResponse = function(result)
	{
		var abort = false;
		authRequired = false;
		if (result.response != "Success")
		{
			njlog("Answer Failed");
			gAsterisk.updateState("");
			resetIcon();
			if (result.message == "Authentication Required")
			{
				showError(result.response, "The connection to Asterisk was lost, a reconnect will be initiated. Wait a moment and then dial again.");
		
				var sequence = new Sequence( [ new Login(), new Wait(null) ], "", false);
				sequence.run();
			}
			else if (result.message.indexOf("Permission denied") == 0)
			{
				gAsterisk.setLoggedIn(false);
				if (result.message == "Permission denied: please login first.")
				{
					showError(result.response, "Invalid Username/Password. Please check your Noojee Click configuration against manager.conf.");
				}
				else
					showError(result.response, "Permission Denied, please check the read/write options in manager.conf.");
			}
			else
			{
				// If we are nolonger in a local dial, then we don't 
				// care that the dial failed.
				// This can happen if the user hangs up a call just after
				// starting to dial it.
				if (gAsterisk.isLocalDialInProgress())
					showError(result.response, "Dial failed: " + result.message);
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
		return gAsterisk.parseResponse(responseText);
	}
}


// Wait Job
function Wait(subSequence)
{
	this.ranOnce = false;
	this.subSequence = subSequence;

	this.run = function(sequence, param)
	{
		// Start monitoring events
		var url = genURL("WaitEvent");
		// The first time through we want wait to return immediately so we can
		// start the subSequence
		if (this.ranOnce == false && this.subSequence != null)
			url += "&Timeout=1";
		else
			url += "&Timeout=30";

		njdebug("job", "url=" + url);

		njdebug("job", "starting event monitoring");

		this.status = function()
		{
			njlog("WaitEvent: event monitoring initialised.");
		}

		njdebug("job", "waitEventurl=" + url);
		sequence.request(url);
	}

	this.doContinue = function()
	{
		return true;
	}
	
	this.parseResponse = function(responseText)
	{
		return gAsterisk.parseResponse(responseText);
	}
	
	this.handleResponse = function(result)
	{
		var abort = false;

		njdebug("job", "waitEvent has returned, result=" + result);
		if (result.response != "Success")
		{
			showError(result.response, result.message);
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
		resetIcon();
		gAsterisk.updateState("");
		
		if (responseText == null || responseText.length == 0)
		{
			njlog("Unexpected error responseText is empty, asterisk may be down.");
			showError(responseText, "Unable to connect to Asterisk.");
		}
		else
		{
			var result = parseResponse(details.responseText);
			njlog("Action failed " + result.message);
			showError(result.response, result.message);
		}
	}

}

function HangupAction(channel)
{
	this.channel = channel;
	
	this.run = function(sequence, dummy)
	{
		extension = getValue("extension");
		context = getValue("context");

		gAsterisk.updateState("");
		resetIcon();

		if (extension == null)
		{
			njAlert("Please enter your extension via the configuration panel first.");
			return;
		}

		if (context == null)
		{
			njAlert("Please enter the context via the configuration panel first.");
			return;
		}

		// If no tech specified then add SIP/ otherwise use the selected tech.
		var channel = "&Channel=" + this.channel;

		njdebug("job", "hangup channel=" + this.channel);

		// dial
		var url = genURL("Hangup");
		url += channel;
		url += "&Context=" + context;

		njdebug("job", "url=" + url);

		url += "&Priority=1";

		njdebug("job", "Hangup");

		this.status = function()
		{
			njlog("Hangup: " + extension);
		}

		//getStatusWindow().updateStatus("Hangup: " + extension);
		njdebug("job", "hangup url=" + url);
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
			showError(result.response, result.message);
			abort = true;
		}
		return abort;
	}


	this.parseResponse = function(responseText)
	{
		return gAsterisk.parseResponse(responseText);
	}
	
}

// Ping Job
function Ping()
{
	this.run = function(sequence, param)
	{
		njlog("ping");
		// ping
		var url = genURL("Ping");

		this.status = function()
		{
			njlog("Pinging");
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
			showError(result.response, result.message);
			abort = true;
		}
		return abort;
	}

	this.parseResponse = function(responseText)
	{
		return gAsterisk.parseResponse(responseText);
	}
	
}

// Status Job
function Status()
{
	this.run = function(sequence, param)
	{
		njlog("status");
		// status
		var url = genURL("Status");

		this.status = function()
		{
			njlog("Checking Asterisk Status");
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
			showError(result.response, result.message);
			abort = true;
		}
		return abort;
	}

	this.parseResponse = function(responseText)
	{
		return gAsterisk.parseResponse(responseText);
	}
	
}

// Complete Job
function Complete()
{
	this.run = function(sequence, param)
	{
		njdebug("job", "compete");
		// status
		this.status = function()
		{
			njdebug("job", "Checking Asterisk Status");
		}

		//getStatusWindow().updateStatus("Dialed: " + param);
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
			showError(result.response, result.message);
			abort = true;
		}
		return abort;
	}

	this.parseResponse = function(responseText)
	{
		return gAsterisk.parseResponse(responseText);
	}
	
}

// Login Job
function Login()
{
	this.run = function(sequence, phoneNo)
	{
		njdebug("job", "login");
		var url = genURL("Login");
		username = getValue("username");
		password = getValue("password"); 
		gAsterisk.setLoggedIn(false);
		
		njdebug("job", "Username: " + username);
		url += "&Username=" + username;
		url += "&Secret=" + password;
		url += "&Events=call";

		this.status = function()
		{
			njlog("Authenticating");
		}

		// getStatusWindow().updateStatus("Authenticating");

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
			gAsterisk.setLoggedIn(false);
			showError(result.response, result.message);
			abort = true;
		}
		else
		{
			gAsterisk.setLoggedIn(true);
			njlog("Login completed.");
		}
		return abort;
	}

	this.parseResponse = function(responseText)
	{
		return gAsterisk.parseResponse(responseText);
	}
	
}

// Logoff Job
function Logoff()
{
	this.run = function(sequence, phoneNo)
	{
		var url = genURL("Logoff");
		gAsterisk.setLoggedIn(false);

		this.status = function()
		{
			njlog("Logging off");
		}

		getStatusWindow().updateStatus("Logging Off");
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
			showError(result.response, result.message);
			abort = true;
		}
		return abort;
	}

	this.parseResponse = function(responseText)
	{
		return gAsterisk.parseResponse(responseText);
	}
	
}

// Returns the url to execute when the user clicks on the url
function genURL(command)
{
	njdebug("job", "genURL(command)=" + command);
	var url;

	var protocol = "http://";
	
	var useHTTPS = getBoolValue("useHttps");
	if (useHTTPS == true)
		protocol = "https://";
	
	var host = getValue("host");
	var port = getValue("port");
	serverType = getValue("serverType");
	var httpPrefix = getValue("httpPrefix");
	// The asterisk appliance doesn't allow a prefix so we need to support a null prefix
	if (httpPrefix == null || trim(httpPrefix).length == 0)
		httpPrefix = "/";
	else
		httpPrefix = "/" + trim(httpPrefix) + "/";
	njdebug("job", "serverType=" + serverType);
	if (serverType == serverTypeList[0].type)
		url = protocol + host + ":" + port + httpPrefix + "manager?action=" + command;
	else if (serverType == serverTypeList[1].type)
		url = protocol + host + ":" + port + httpPrefix + "mxml?action=" + command;
	else
	{
		njlog("Error: Unknown server type selected =" + serverType);
		njAlert("Unknown server type selected =" + serverType);
	}

	njdebug("job", "genURL ret=" + url);
	return url;
}


