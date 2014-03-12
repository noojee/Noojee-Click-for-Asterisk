/**
 * Copyright 2012 Brett Sutton
 * (Adapted for Google Chrome by Sven Werlen)
 *
 * This file is part of Noojee Click.
 * 
 * Noojee Click is free software: you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the 
 * Free Software Foundation, either version 3 of the License, or (at your 
 * option) any later version.
 * 
 * Noojee Click is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License 
 * for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with Noojee Click. If not, see http://www.gnu.org/licenses/.
 **/

noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.job =
{
name: null,

// The Dial Job
Dial: function ()
{
	this.name = "dial";
	
	this.run = function(sequence, phoneNo)
	{
		var normalised = theApp.phonepatterns.normalisePhoneNo(phoneNo);
		var extension = theApp.prefs.getValue("extension");
		var context = theApp.prefs.getValue("context");
		var handsetType = theApp.prefs.getValue("handsetType");
		
		// desktop notification "Dialing ...."
		theApp.notification.getInstance().dialing("Dialing: " + phoneNo);
				
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

		theApp.logging.njdebug("job", "Channel=" + channel);

		// dial
		var url = theApp.job.genURL("Originate");
		url += channel;
		url += "&Exten=" + normalised;
		url += "&Context=" + context;
		
		// If the user has configured the callerId then lets set it.
		// We try to control the callerID that is presented to the 
		// far end by setting CALLERID(Num).
		var callerID = theApp.prefs.getValue("callerId");
		
		var quickpickEnabled = theApp.prefs.getBoolValue("clidquickpick.enabled");
		var quickpickActive = theApp.prefs.getValue("clidquickpick.active");
		
		if (quickpickEnabled && quickpickActive != null && quickpickActive != "")
		{
			theApp.logging.njdebug("job", "active clid quickpick=" + quickpickActive);
			theApp.logging.njdebug("job", "getting quickpick for=" + "clidquickpick.pick-" + quickpickActive + "-clid");
			callerID = theApp.prefs.getValue("clidquickpick.pick-" + quickpickActive + "-clid");
			theApp.logging.njdebug("job", "quickpick clid=" + callerID);

		}
		
		// The CallerId must only contain numbers as the likes of trixbox
		// will drop the call if it contains non-digits.
		if (callerID != null)
		{
			url += "&CallerId=" + callerID;
		}
		else 
			url += "&CallerId=" + normalised; // no caller id so we like to display the number we dialing
												// on the users handset.

		// The next two variables are set to display the number that
		// is being dialed on the local handset's LCD.
		// The CALLERID(Name) is set for sip phones that can display text (I think this might work)

		url += "&Variable=CALLERID(Num)=" + normalised; // Hopefully sets the handsets display 
		url += "&Variable=CALLERID(Name)=" + "Dialing: " + phoneNo ;  //and this as well.
		url += "&Variable=njClickOriginated=true";  //Tells Noojee Answer and everybody else that NJ click started the call.
		
		var supressNjAnswer = theApp.prefs.getBoolValue("supressNoojeeAnswerBar.enabled");
		if (supressNjAnswer)
			url += "&Variable=njAnswerIgnore=true";  //Tells Noojee Answer to ignore the call. If you want pops on NJ Click originated calls then enable 'suspressNjAnswer on the Advanced tab

		theApp.logging.njdebug("job", "url=" + url);

		// Get the auto answer header if there is one
		var enableAutoAnswer = theApp.prefs.getBoolValue("enableAutoAnswer");
		theApp.logging.njdebug("job", "AutoAnswer=" + enableAutoAnswer + " handsetType=" + handsetType);
		if (enableAutoAnswer)
		{
			var i = 0;
			for (i = 0; i < theApp.noojeeclick.autoAnswerList.length; i++)
			{
				theApp.logging.njdebug("job", "manufacturer(i)=" + theApp.noojeeclick.autoAnswerList[i].manufacturer);
				if (handsetType == theApp.noojeeclick.autoAnswerList[i].manufacturer)
				{
					url += "&Variable=" + "SIPAddHeader=" + theApp.noojeeclick.autoAnswerList[i].header;
					break;
				}
			}
		}

		url += "&Priority=1";

		theApp.logging.njdebug("job", "Dialing");

		this.status = function()
		{
			theApp.logging.njlog("Dialing: " + phoneNo + " (" + normalised + ")");
		};

		theApp.dialstatus.getInstance().updateStatus("Dialing: " + phoneNo);
		theApp.logging.njdebug("job", "dialurl=" + url);
		sequence.request(url);
	};

	this.handleResponse = function(result)
	{
		var abort = false;
		if (result.response != "Success")
		{
			theApp.logging.njlog("Dial Failed");
			theApp.asterisk.getInstance().updateState("");
			theApp.noojeeclick.resetIcon();
			theApp.notification.getInstance().hide();
			
			if (result.message == "Authentication Required")
			{
				theApp.dialstatus.getInstance().updateStatus("The connection to Asterisk was lost. Wait whilst we reconnect.");
		
				var sequence = new theApp.sequence.Sequence( [ new theApp.job.Login(), new theApp.job.Wait(null) ], "", false);
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
	};

	this.doContinue = function()
	{
		return false;
	};
	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	};
},

//The Answer Job
Answer: function (channel)
{
	this.name = "Answer";
	
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

		theApp.logging.njdebug("job", "LocalChannel=" + localChannel);

		// dial
		var url = theApp.job.genURL("Redirect");
		url += localChannel;
		url += "&Exten=" + this.channel;
		url += "&Context=" + context;
		url += "&CallerId=" + phoneNo; // + "-NoojeeClick";
	
		theApp.logging.njdebug("job", "url=" + url);

		// Get the auto answer header if there is one
		enableAutoAnswer = theApp.prefs.getBoolValue("enableAutoAnswer");
		theApp.logging.njdebug("job", "AutoAnswer=" + enableAutoAnswer + " handsetType=" + handsetType);
		if (enableAutoAnswer)
		{
			var i = 0;
			for (i = 0; i < theApp.noojeeclick.autoAnswerList.length; i++)
			{
				theApp.logging.njdebug("job", "manufacturer(i)=" + theApp.noojeeclick.autoAnswerList[i].manufacturer);
				if (handsetType == theApp.noojeeclick.autoAnswerList[i].manufacturer)
				{
					url += "&Variable=" + "SIPAddHeader=" + theApp.noojeeclick.autoAnswerList[i].header;
					break;
				}
			}
		}

		url += "&Priority=1";

		theApp.logging.njdebug("job", "Answering");

		this.status = function()
		{
			theApp.logging.njlog("Answering: " + phoneNo + " (" + normalised + ")");
		};

		theApp.dialstatus.getInstance().updateStatus("Answering: " + phoneNo);
		theApp.logging.njdebug("job", "answerurl=" + url);
		sequence.request(url);
	};

	this.handleResponse = function(result)
	{
		var abort = false;
		authRequired = false;
		if (result.response != "Success")
		{
			theApp.logging.njlog("Answer Failed");
			theApp.asterisk.getInstance().updateState("");
			theApp.noojeeclick.resetIcon();
			if (result.message == "Authentication Required")
			{
				theApp.dialstatus.getInstance().updateStatus("The connection to Asterisk was lost. Wait whilst we reconnect.");
		
				var sequence = new theApp.sequence.Sequence( [ new theApp.job.Login(), new theApp.job.Wait(null) ], "", false);
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
	};

	this.doContinue = function()
	{
		return false;
	};
	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	};
},


// Wait Job
Wait: function (subSequence)
{
	this.name = "Wait";
	
	this.ranOnce = false;
	this.subSequence = subSequence;

	this.run = function(sequence, param)
	{
		// Start monitoring events
		var url = theApp.job.genURL("WaitEvent");
		// The first time through we want wait to return immediately so we can
		// start the subSequence
		if (this.ranOnce == false && this.subSequence != null)
			url += "&Timeout=0";
		else
			url += "&Timeout=30";

		theApp.logging.njdebug("job", "url=" + url);

		theApp.logging.njdebug("job", "starting event monitoring");

		this.status = function()
		{
			theApp.logging.njlog("WaitEvent: event monitoring initialised.");
		};

		theApp.logging.njdebug("job", "waitEventurl=" + url);
		sequence.request(url);
	};

	this.doContinue = function()
	{
		return true;
	};
	
	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	};
	
	this.handleResponse = function(result)
	{
		var abort = false;

		theApp.logging.njdebug("job", "waitEvent has returned, result=" + result);
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
	};
	
	this.error = function(responseText)
	{
		theApp.noojeeclick.resetIcon();
		theApp.asterisk.getInstance().updateState("");
		
		if (responseText == null || responseText.length == 0)
		{
			theApp.logging.njlog("Unexpected error responseText is empty, asterisk may be down.");
			theApp.dialstatus.getInstance().updateStatus("Unable to connect to Asterisk.");
		}
		else
		{
			var result = parseResponse(details.responseText);
			theApp.logging.njlog("Action failed " + result.message);
			theApp.util.showError(result.response, result.message);
		}
	};

},

HangupAction: function (channel)
{
	this.name = "HangupAction";
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
		var channelArg = "&Channel=" + this.channel;

		theApp.logging.njdebug("job", "hangup channel=" + this.channel);

		// dial
		var url = theApp.job.genURL("Hangup");
		url += channelArg;
		url += "&Context=" + context;

		theApp.logging.njdebug("job", "url=" + url);

		url += "&Priority=1";

		theApp.logging.njdebug("job", "Hangup");

		this.status = function()
		{
			theApp.logging.njlog("Hangup: " + extension);
		};

		//theApp.dialstatus.getInstance().updateStatus("Hangup: " + extension);
		theApp.logging.njdebug("job", "hangup url=" + url);
		sequence.request(url);
	};

	this.doContinue = function()
	{
		return false;
	};

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
		window.setTimeout(function () {noojeeClick.asterisk.getInstance().updateState('');}, 3000);
		
		return abort;
	};


	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	};
	
},

// Ping Job
Ping: function ()
{
	this.name = "Ping";
	this.run = function(sequence, param)
	{
		theApp.logging.njlog("ping");
		// ping
		var url = theApp.job.genURL("Ping");

		this.status = function()
		{
			theApp.logging.njlog("Pinging");
		};

		sequence.request(url);
	};

	this.doContinue = function()
	{
		return false;
	};

	this.handleResponse = function(result)
	{
		var abort = false;
		if (result.response != "Success")
		{
			theApp.util.showError(result.response, result.message);
			abort = true;
		}
		return abort;
	};

	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	};
	
},

// Status Job
Status: function ()
{
	this.name = "Status";
	
	this.run = function(sequence, param)
	{
		theApp.logging.njlog("status");
		// status
		var url = theApp.job.genURL("Status");

		this.status = function()
		{
			theApp.logging.njlog("Checking Asterisk Status");
		};

		sequence.request(url);
	};

	this.doContinue = function()
	{
		return false;
	};

	this.handleResponse = function(result)
	{
		var abort = false;
		if (result.response != "Success")
		{
			theApp.util.showError(result.response, result.message);
			abort = true;
		}
		return abort;
	};

	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	};
	
},

// Complete Job
Complete: function ()
{
	this.name = "Complete";
	
	this.run = function(sequence, param)
	{
		theApp.logging.njdebug("job", "complete");
		// status
		this.status = function()
		{
			theApp.logging.njdebug("job", "Checking Asterisk Status");
		};

		theApp.notification.getInstance().hide();
		//theApp.dialstatus.getInstance().updateStatus("Dialed: " + param);
	};

	this.doContinue = function()
	{
		return false;
	};

	this.handleResponse = function(result)
	{
		var abort = false;
		if (result.response != "Success")
		{
			theApp.util.showError(result.response, result.message);
			abort = true;
		}
		return abort;
	};

	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	};
	
},

// Login Job
Login: function ()
{
	this.name = "Login";
	this.run = function(sequence, phoneNo)
	{
		theApp.logging.njdebug("job", "login");
		var url = theApp.job.genURL("Login");
		var username = theApp.prefs.getUsername();
		var password = theApp.prefs.getPassword(username);
		theApp.asterisk.getInstance().setLoggedIn(false);
		
		theApp.logging.njdebug("job", "Username: " + username);
		url += "&Username=" + username;
		url += "&Secret=" + password;
		url += "&Events=call";

		this.status = function()
		{
			theApp.logging.njlog("Authenticating");
		};

		// theApp.dialstatus.getInstance().updateStatus("Authenticating");

		sequence.request(url);
	};

	this.doContinue = function()
	{
		return false;
	};

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
			//theApp.asterisk.getInstance().updateState("Login successful.");
			theApp.logging.njlog("Login successful.");
		}
		return abort;
	};

	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	};
	
},

// Logoff Job
Logoff: function ()
{
	this.name = "Logoff";
	
	this.run = function(sequence, phoneNo)
	{
		var url = theApp.job.genURL("Logoff");
		theApp.asterisk.getInstance().setLoggedIn(false);

		this.status = function()
		{
			theApp.logging.njlog("Logging off");
		};

		theApp.dialstatus.getInstance().updateStatus("Logging Off");
		sequence.request(url);

	};

	this.doContinue = function()
	{
		return false;
	};

	this.handleResponse = function(result)
	{
		var abort = false;
		if (result.response != "Success")
		{
			theApp.util.showError(result.response, result.message);
			abort = true;
		}
		return abort;
	};

	this.parseResponse = function(responseText)
	{
		return theApp.asterisk.getInstance().parseResponse(responseText);
	};
	
},

// Returns the url to execute when the user clicks on the url
genURL: function (command)
{
	theApp.logging.njdebug("job", "genURL(command)=" + command);
	var url = null;

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
	theApp.logging.njdebug("job", "serverType=" + serverType);
	if (serverType == theApp.noojeeclick.serverTypeList[0].type)
		url = protocol + host + ":" + port + httpPrefix + "manager?action=" + command;
	else if (serverType == theApp.noojeeclick.serverTypeList[1].type)
		url = protocol + host + ":" + port + httpPrefix + "mxml?action=" + command;
	else
	{
		theApp.logging.njlog("Error: Unknown server type selected =" + serverType);
		theApp.prompts.njAlert("Unknown server type selected =" + serverType);
	}

	theApp.logging.njdebug("job", "genURL ret=" + url);
	return url;
},

toString : function (jobs)
{
	var string = "";
	for (var i = 0; i < jobs.length; i++)
	{
		if (string.length > 0)
			string += ", ";
		string += jobs[i].name;	
	}
	return string;
}



};

}});