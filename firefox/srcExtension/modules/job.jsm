var EXPORTED_SYMBOLS = ["Login", "Logoff", "Dial", "Wait", "HangupAction", "Complete"];

Components.utils.import("resource://noojeeclick/constants.jsm");
Components.utils.import("resource://noojeeclick/util.jsm");
Components.utils.import("resource://noojeeclick/prefs.jsm");
Components.utils.import("resource://noojeeclick/statusbar.jsm");
Components.utils.import("resource://noojeeclick/prompts.jsm");
Components.utils.import("resource://noojeeclick/asterisk.jsm");
Components.utils.import("resource://noojeeclick/phonepatterns.jsm");

// The Dial Job
function Dial(asterisk)
{
	this.asterisk = asterisk;
	
	this.run = function(sequence, phoneNo)
	{
		var normalised = normalisePhoneNo(phoneNo);
		extension = getValue("extension");
		context = getValue("context");
		handsetType = getValue("handsetType");
		
		statusbar.showHangupIcon();

		if (extension == null)
		{
			prompt.error("Please enter your extension via the configuration panel first.");
			return;
		}

		if (context == null)
		{
			prompt.error("Please enter the context via the configuration panel first.");
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
		var url = this.asterisk.genURL("Originate");
		url += channel;
		url += "&Exten=" + normalised;
		url += "&Context=" + context;
		url += "&ActionID=" + "42";
//		url += "&CallerID=" + phoneNo; // + "-NoojeeClick";
		url += "&Variable=CALLERID(Name)=" + phoneNo; 
		
		// Set the user definable callerID.
		var callerID = getValue("callerID");
		if (callerID != null)
			url += "&Variable=CALLERID(Num)=" + callerID;

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

		njdebug("job", "Dialing" + phoneNo + " (" + normalised + ")");

		statusbar.updateStatus("Dialing: " + phoneNo);
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
			this.asterisk.updateState("");
			statusbar.resetIcon();
			if (result.message == "Authentication Required")
			{
				prompt.error(result.response, "The connection to Asterisk was lost, a reconnect will be initiated. Wait a moment and then dial again.");
		
				var sequence = new Sequence(this.asterisk.xmlHttpRequest,  [ new Login(), new Wait(null) ], "", false);
				sequence.run();
			}
			else if (result.message.indexOf("Permission denied") == 0)
			{
				this.asterisk.setLoggedIn(false);
				if (result.message == "Permission denied: please login first.")
				{
					prompt.error(result.response, "Invalid Username/Password. Please check your Noojee Click configuration against manager.conf.");
				}
				else
					prompt.error(result.response, "Permission Denied, please check the read/write options in manager.conf.");
			}
			else
			{
				// If we are nolonger in a local dial, then we don't 
				// care that the dial failed.
				// This can happen if the user hangs up a call just after
				// starting to dial it.
				if (this.asterisk.isLocalDialInProgress())
					prompt.error(result.response, "Dial failed: " + result.message);
			}
			
			abort = true;
		}
		return !abort;
	}

	this.doContinue = function()
	{
		return false;
	}
	this.parseResponse = function(responseText)
	{
		return this.asterisk.parseResponse(responseText);
	}
}

//The Answer Job
function Answer(asterisk, channel)
{
	this.asterisk = asterisk;
	this.channel = channel;
	
	this.run = function(sequence, phoneNo)
	{
		var normalised = normalisePhoneNo(phoneNo);
		extension = getValue("extension");
		context = getValue("context");
		handsetType = getValue("handsetType");
		
		statusbar.showHangupIcon();

		if (extension == null)
		{
			prompt.error("Please enter your extension via the configuration panel first.");
			return;
		}

		if (context == null)
		{
			prompt.error("Please enter the context via the configuration panel first.");
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
		var url = this.asterisk.genURL("Redirect");
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

		statusbar.updateStatus("Answering: " + phoneNo);
		njdebug("job", "answerurl=" + url);
		sequence.request(url);
	}

	this.handleResponse = function(result)
	{
		var abort = false;
		if (result.response != "Success")
		{
			njlog("Answer Failed");
			this.asterisk.updateState("");
			statusbar.resetIcon();
			if (result.message == "Authentication Required")
			{
				prompt.error(result.response, "The connection to Asterisk was lost, a reconnect will be initiated. Wait a moment and then dial again.");
		
				var sequence = new Sequence(this.asterisk.xmlHttpRequest,  [ new Login(), new Wait(null) ], "", false);
				sequence.run();
			}
			else if (result.message.indexOf("Permission denied") == 0)
			{
				if (result.message == "Permission denied: please login first.")
				{
					prompt.error(result.response, "Invalid Username/Password. Please check your Noojee Click configuration against manager.conf.");
				}
				else
					prompt.error(result.response, "Permission Denied, please check the read/write options in manager.conf.");
			}
			else
			{
				// If we are nolonger in a local dial, then we don't 
				// care that the dial failed.
				// This can happen if the user hangs up a call just after
				// starting to dial it.
				if (this.asterisk.isLocalDialInProgress())
					prompt.error(result.response, "Dial failed: " + result.message);
			}
			
			abort = true;
		}
		return !abort;
	}

	this.doContinue = function()
	{
		return false;
	}
	this.parseResponse = function(responseText)
	{
		return this.asterisk.parseResponse(responseText);
	}
}


// Wait Job
function Wait(asterisk, subSequence)
{
	this.asterisk = asterisk;
	this.ranOnce = false;
	this.subSequence = subSequence;

	njdebug("job", "Created WaitJob");
	
	/**
	 * sequence - the Sequence object that is running this job.
	 * param - not used by the Wait job.
	 */
	this.run = function(sequence, param)
	{
		njdebug("job", "Running Wait Job ranOnce=" + this.ranOnce + " subsequence=" + this.subSequence);
		
		// Start monitoring events
		var url = this.asterisk.genURL("WaitEvent");
		
		// The first time through we want wait to return immediately so we can
		// start the subSequence
		if (this.ranOnce == false && this.subSequence != null)
			url += "&Timeout=1";
		else
			url += "&Timeout=30";

	
		sequence.request(url);
	}

	this.doContinue = function()
	{
		return true;
	}
	
	this.parseResponse = function(responseText)
	{
		return this.asterisk.parseResponse(responseText);
	}
	
	this.handleResponse = function(result)
	{
		var abort = false;

		if (result.response != "Success")
		{
			njdebug("job", "waitEvent has returned error with result=" + result);
			prompt.error(result.response, result.message);
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
				{
					njdebug("job", "WaitJob starting subsequence");
					this.subSequence.run();
				}
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
		return !abort;
	}
	
	this.error = function(responseText)
	{
		statusbar.resetIcon();
		this.asterisk.updateState("");
		
		if (responseText == null || responseText.length == 0)
		{
			njlog("Unexpected error responseText is empty, asterisk may be down.");
			prompt.error(responseText, "Unable to connect to Asterisk.");
		}
		else
		{
			var result = parseResponse(details.responseText);
			njlog("Action failed " + result.message);
			prompt.error(result.response, result.message);
		}
	}

}

function HangupAction(asterisk, channel)
{
	this.asterisk = asterisk;
	this.channel = channel;
	
	this.run = function(sequence, dummy)
	{
		extension = getValue("extension");
		context = getValue("context");

		this.asterisk.updateState("");
		statusbar.resetIcon();

		if (extension == null)
		{
			prompt.error("Please enter your extension via the configuration panel first.");
			return;
		}

		if (context == null)
		{
			prompt.error("Please enter the context via the configuration panel first.");
			return;
		}

		// If no tech specified then add SIP/ otherwise use the selected tech.
		var channel = "&Channel=" + this.channel;

		njdebug("job", "hangup channel=" + this.channel);

		// dial
		var url = this.asterisk.genURL("Hangup");
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
			prompt.error(result.response, result.message);
			abort = true;
		}
		return !abort;
	}


	this.parseResponse = function(responseText)
	{
		return this.asterisk.parseResponse(responseText);
	}
	
}

// Ping Job
function Ping(asterisk)
{
	this.asterisk = asterisk;
	this.run = function(sequence, param)
	{
		njlog("ping");
		// ping
		var url = this.asterisk.genURL("Ping");

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
			prompt.error(result.response, result.message);
			abort = true;
		}
		return !abort;
	}

	this.parseResponse = function(responseText)
	{
		return this.asterisk.parseResponse(responseText);
	}
	
}

// Status Job
function Status(asterisk)
{
	this.asterisk = asterisk;
	
	this.run = function(sequence, param)
	{
		njlog("status");
		// status
		var url = this.asterisk.genURL("Status");

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
			prompt.error(result.response, result.message);
			abort = true;
		}
		return !abort;
	}

	this.parseResponse = function(responseText)
	{
		return this.asterisk.parseResponse(responseText);
	}
	
}

// Complete Job
function Complete(asterisk)
{
	this.asterisk = asterisk;
	
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
			prompt.error(result.response, result.message);
			abort = true;
		}
		return !abort;
	}

	this.parseResponse = function(responseText)
	{
		return this.asterisk.parseResponse(responseText);
	}
	
}

// Login Job
function Login(asterisk)
{
	this.asterisk = asterisk;
	
	this.run = function(sequence, phoneNo)
	{
		njdebug("job", "login");
		var url = this.asterisk.genURL("Login");
		username = getValue("username");
		password = getValue("password"); 
		this.asterisk.setLoggedIn(false);
		
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
			prompt.error(result.response, result.message);
			abort = true;
		}
		else
		{
			this.asterisk.setLoggedIn(true);
			njlog("Login completed.");
		}
		return !abort;
	}

	this.parseResponse = function(responseText)
	{
		return this.asterisk.parseResponse(responseText);
	}
	
}

// Logoff Job
function Logoff(asterisk)
{
	this.asterisk = asterisk;
	
	this.run = function(sequence, phoneNo)
	{
		var url = this.asterisk.genURL("Logoff");
		this.asterisk.setLoggedIn(false);

		statusbar.updateStatus("Logging Off");
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
			prompt.error(result.response, result.message);
			abort = true;
		}
		return !abort;
	}

	this.parseResponse = function(responseText)
	{
		return this.asterisk.parseResponse(responseText);
	}
	
}



