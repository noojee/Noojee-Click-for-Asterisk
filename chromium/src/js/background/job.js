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


// The Job module
var job = ( function( window, undefined ) 
{
	var name = null;
	  
	// The Dial Job
	function Dial()
	{
		this.name = "dial";
		
		this.run = function(sequence, phoneNo)
		{
			var normalised = phonepatterns.normalisePhoneNo(phoneNo);
			var extension = options.getInstance().getValue("extension");
			var context = options.getInstance().getValue("context");
			var handsetType = options.getInstance().getValue("handsetType");
			
			// desktop notification "Dialing ...."
			notification.getInstance().dialing("Dialing: " + phoneNo);
					
			if (extension === null)
			{
				prompts.njAlert("Please enter your extension via the configuration panel first.");
				return;
			}
	
			if (context === null)
			{
				prompts.njAlert("Please enter the context via the configuration panel first.");
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
	
			logging.getInstance().njdebug("job", "Channel=" + channel);
	
			// dial
			var url = job.genURL("Originate");
			url += channel;
			url += "&Exten=" + normalised;
			url += "&Context=" + context;
			
			// If the user has configured the callerId then lets set it.
			// We try to control the callerID that is presented to the 
			// far end by setting CALLERID(Num).
			var callerID = options.getInstance().getValue("callerId");
			
			var quickpickEnabled = options.getInstance().getBoolValue("clidquickpick.enabled");
			var quickpickActive = options.getInstance().getValue("clidquickpick.active");
			
			if (quickpickEnabled && quickpickActive !== null && quickpickActive !== "")
			{
				logging.getInstance().njdebug("job", "active clid quickpick=" + quickpickActive);
				logging.getInstance().njdebug("job", "getting quickpick for=" + "clidquickpick.pick-" + quickpickActive + "-clid");
				callerID = options.getInstance().getValue("clidquickpick.pick-" + quickpickActive + "-clid");
				logging.getInstance().njdebug("job", "quickpick clid=" + callerID);
	
			}
			
			// The CallerId must only contain numbers as the likes of trixbox
			// will drop the call if it contains non-digits.
			if (callerID !== null)
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
			url += "&Variable=NoojeeAPICallerIDNum=" + callerID; // NoojeePBX over-writes CALLERID(NUM) but will use this.
			url += "&Variable=CALLERID(Name)=" + "Dialing: " + phoneNo ;  //and this as well.
			url += "&Variable=njClickOriginated=true";  //Tells Noojee Answer and everybody else that NJ click started the call.
			
			var supressNjAnswer = options.getInstance().getBoolValue("supressNoojeeAnswerBar.enabled");
			if (supressNjAnswer)
				url += "&Variable=njAnswerIgnore=true";  //Tells Noojee Answer to ignore the call. If you want pops on NJ Click originated calls then enable 'suspressNjAnswer on the Advanced tab
	
			logging.getInstance().njdebug("job", "url=" + url);
	
			// Get the auto answer header if there is one
			var enableAutoAnswer = options.getInstance().getBoolValue("enableAutoAnswer");
			logging.getInstance().njdebug("job", "AutoAnswer=" + enableAutoAnswer + " handsetType=" + handsetType);
			if (enableAutoAnswer)
			{
				var i = 0;
				for (i = 0; i < noojeeclick.autoAnswerList.length; i++)
				{
					logging.getInstance().njdebug("job", "manufacturer(i)=" + noojeeclick.autoAnswerList[i].manufacturer);
					if (handsetType == noojeeclick.autoAnswerList[i].manufacturer)
					{
						url += "&Variable=" + "SIPAddHeader=" + noojeeclick.autoAnswerList[i].header;
						break;
					}
				}
			}
	
			url += "&Priority=1";
	
			logging.getInstance().njdebug("job", "Dialing");
	
			this.status = function()
			{
				logging.getInstance().njlog("Dialing: " + phoneNo + " (" + normalised + ")");
			};
	
			dialstatus.getInstance().updateStatus("Dialing: " + phoneNo);
			logging.getInstance().njdebug("job", "dialurl=" + url);
			sequence.request(url);
		};
	
		this.handleResponse = function(result)
		{
			var abort = false;
			if (result.response != "Success")
			{
				logging.getInstance().njlog("Dial Failed");
				asterisk.getInstance().updateState("");
				noojeeclick.resetIcon();
				notification.getInstance().hide();
				
				if (result.message == "Authentication Required")
				{
					dialstatus.getInstance().updateStatus("The connection to Asterisk was lost. Wait whilst we reconnect.");
			
					var sequence = new sequence.Sequence( [ new job.Login(), new job.Wait(null) ], "", false);
					sequence.run();
				}
				else if (result.message.indexOf("Permission denied") === 0)
				{
					asterisk.getInstance().setLoggedIn(false);
					if (result.message == "Permission denied: please login first.")
					{
						util.showError(result.response, "Invalid Username/Password. Please check your Noojee Click configuration against manager.conf.");
					}
					else
						util.showError(result.response, "Permission Denied, please check the read/write options in manager.conf.");
				}
				else
				{
					// If we are nolonger in a local dial, then we don't 
					// care that the dial failed.
					// This can happen if the user hangs up a call just after
					// starting to dial it.
					if (asterisk.getInstance().isLocalDialInProgress())
						util.showError(result.response, "Dial failed: " + result.message);
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
			return asterisk.getInstance().parseResponse(responseText);
		};
	}
	
	//The Answer Job
	function Answer(channel)
	{
		this.name = "Answer";
		
		this.channel = channel;
		
		this.run = function(sequence, phoneNo)
		{
			var normalised = phonepatterns.normalisePhoneNo(phoneNo);
			var extension = options.getInstance().getValue("extension");
			var context = options.getInstance().getValue("context");
			var handsetType = options.getInstance().getValue("handsetType");
			
			noojeeclick.showHangupIcon();
	
			if (extension === null)
			{
				prompts.njAlert("Please enter your extension via the configuration panel first.");
				return;
			}
	
			if (context === null)
			{
				prompts.njAlert("Please enter the context via the configuration panel first.");
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
	
			logging.getInstance().njdebug("job", "LocalChannel=" + localChannel);
	
			// dial
			var url = job.genURL("Redirect");
			url += localChannel;
			url += "&Exten=" + this.channel;
			url += "&Context=" + context;
			url += "&CallerId=" + phoneNo; // + "-NoojeeClick";
		
			logging.getInstance().njdebug("job", "url=" + url);
	
			// Get the auto answer header if there is one
			enableAutoAnswer = options.getInstance().getBoolValue("enableAutoAnswer");
			logging.getInstance().njdebug("job", "AutoAnswer=" + enableAutoAnswer + " handsetType=" + handsetType);
			if (enableAutoAnswer)
			{
				var i = 0;
				for (i = 0; i < noojeeclick.autoAnswerList.length; i++)
				{
					logging.getInstance().njdebug("job", "manufacturer(i)=" + noojeeclick.autoAnswerList[i].manufacturer);
					if (handsetType == noojeeclick.autoAnswerList[i].manufacturer)
					{
						url += "&Variable=" + "SIPAddHeader=" + noojeeclick.autoAnswerList[i].header;
						break;
					}
				}
			}
	
			url += "&Priority=1";
	
			logging.getInstance().njdebug("job", "Answering");
	
			this.status = function()
			{
				logging.getInstance().njlog("Answering: " + phoneNo + " (" + normalised + ")");
			};
	
			dialstatus.getInstance().updateStatus("Answering: " + phoneNo);
			logging.getInstance().njdebug("job", "answerurl=" + url);
			sequence.request(url);
		};
	
		this.handleResponse = function(result)
		{
			var abort = false;
			authRequired = false;
			if (result.response != "Success")
			{
				logging.getInstance().njlog("Answer Failed");
				asterisk.getInstance().updateState("");
				noojeeclick.resetIcon();
				if (result.message == "Authentication Required")
				{
					dialstatus.getInstance().updateStatus("The connection to Asterisk was lost. Wait whilst we reconnect.");
			
					var sequence = new sequence.Sequence( [ new job.Login(), new job.Wait(null) ], "", false);
					sequence.run();
				}
				else if (result.message.indexOf("Permission denied") === 0)
				{
					asterisk.getInstance().setLoggedIn(false);
					if (result.message == "Permission denied: please login first.")
					{
						util.showError(result.response, "Invalid Username/Password. Please check your Noojee Click configuration against manager.conf.");
					}
					else
						util.showError(result.response, "Permission Denied, please check the read/write options in manager.conf.");
				}
				else
				{
					// If we are nolonger in a local dial, then we don't 
					// care that the dial failed.
					// This can happen if the user hangs up a call just after
					// starting to dial it.
					if (asterisk.getInstance().isLocalDialInProgress())
						util.showError(result.response, "Dial failed: " + result.message);
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
			return asterisk.getInstance().parseResponse(responseText);
		};
	}
	
	
	// Wait Job
	function Wait(subSequence)
	{
		this.name = "Wait";
		
		this.ranOnce = false;
		this.subSequence = subSequence;
	
		this.run = function(sequence, param)
		{
			// Start monitoring events
			var url = job.genURL("WaitEvent");
			// The first time through we want wait to return immediately so we can
			// start the subSequence
			if (this.ranOnce === false && this.subSequence !== null)
				url += "&Timeout=0";
			else
				url += "&Timeout=30";
	
			logging.getInstance().njdebug("job", "url=" + url);
	
			logging.getInstance().njdebug("job", "starting event monitoring");
	
			this.status = function()
			{
				logging.getInstance().njlog("WaitEvent: event monitoring initialised.");
			};
	
			logging.getInstance().njdebug("job", "waitEventurl=" + url);
			sequence.request(url);
		};
	
		this.doContinue = function()
		{
			return true;
		};
		
		this.parseResponse = function(responseText)
		{
			return asterisk.getInstance().parseResponse(responseText);
		};
		
		this.handleResponse = function(result)
		{
			var abort = false;
	
			logging.getInstance().njdebug("job", "waitEvent has returned, result=" + result);
			if (result.response != "Success")
			{
				util.showError(result.response, result.message);
				abort = true;
			}
			else
			{
				// the wait job is designed to monitor a sub sequence
				// so now that the wait job is running start the sub sequence.
				if (this.ranOnce === false)
				{
					this.ranOnce = true;
					if (this.subSequence !== null)
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
			noojeeclick.resetIcon();
			asterisk.getInstance().updateState("");
			
			if (responseText === null || responseText.length === 0)
			{
				logging.getInstance().njlog("Unexpected error responseText is empty, asterisk may be down.");
				dialstatus.getInstance().updateStatus("Unable to connect to Asterisk.");
			}
			else
			{
				var result = parseResponse(details.responseText);
				logging.getInstance().njlog("Action failed " + result.message);
				util.showError(result.response, result.message);
			}
		};
	
	}
	
	function HangupAction(channel)
	{
		this.name = "HangupAction";
		this.channel = channel;
		
		this.run = function(sequence, dummy)
		{
			var extension = options.getInstance().getValue("extension");
			var context = options.getInstance().getValue("context");
	
			asterisk.getInstance().updateState("");
			noojeeclick.resetIcon();
	
			if (extension === null)
			{
				prompts.njAlert("Please enter your extension via the configuration panel first.");
				return;
			}
	
			if (context === null)
			{
				prompts.njAlert("Please enter the context via the configuration panel first.");
				return;
			}
	
			// If no tech specified then add SIP/ otherwise use the selected tech.
			var channelArg = "&Channel=" + this.channel;
	
			logging.getInstance().njdebug("job", "hangup channel=" + this.channel);
	
			// dial
			var url = job.genURL("Hangup");
			url += channelArg;
			url += "&Context=" + context;
	
			logging.getInstance().njdebug("job", "url=" + url);
	
			url += "&Priority=1";
	
			logging.getInstance().njdebug("job", "Hangup");
	
			this.status = function()
			{
				logging.getInstance().njlog("Hangup: " + extension);
			};
	
			//dialstatus.getInstance().updateStatus("Hangup: " + extension);
			logging.getInstance().njdebug("job", "hangup url=" + url);
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
				util.showError(result.response, result.message);
				abort = true;
			}
			
			// We have now hungup so make certain the status line
			// is clear.
			asterisk.getInstance().updateState("Disconnecting");
			noojeeclick.resetIcon();
			window.setTimeout(function () {noojeeClick.asterisk.getInstance().updateState('');}, 3000);
			
			return abort;
		};
	
	
		this.parseResponse = function(responseText)
		{
			return asterisk.getInstance().parseResponse(responseText);
		};
		
	}
	
	// Ping Job
	function Ping()
	{
		this.name = "Ping";
		this.run = function(sequence, param)
		{
			logging.getInstance().njlog("ping");
			// ping
			var url = job.genURL("Ping");
	
			this.status = function()
			{
				logging.getInstance().njlog("Pinging");
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
				util.showError(result.response, result.message);
				abort = true;
			}
			return abort;
		};
	
		this.parseResponse = function(responseText)
		{
			return asterisk.getInstance().parseResponse(responseText);
		};
		
	}
	
	// Status Job
	function Status()
	{
		this.name = "Status";
		
		this.run = function(sequence, param)
		{
			logging.getInstance().njlog("status");
			// status
			var url = job.genURL("Status");
	
			this.status = function()
			{
				logging.getInstance().njlog("Checking Asterisk Status");
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
				util.showError(result.response, result.message);
				abort = true;
			}
			return abort;
		};
	
		this.parseResponse = function(responseText)
		{
			return asterisk.getInstance().parseResponse(responseText);
		};
		
	}
	
	// Complete Job
	function Complete()
	{
		this.name = "Complete";
		
		this.run = function(sequence, param)
		{
			logging.getInstance().njdebug("job", "complete");
			// status
			this.status = function()
			{
				logging.getInstance().njdebug("job", "Checking Asterisk Status");
			};
	
			notification.getInstance().hide();
			//dialstatus.getInstance().updateStatus("Dialed: " + param);
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
				util.showError(result.response, result.message);
				abort = true;
			}
			return abort;
		};
	
		this.parseResponse = function(responseText)
		{
			return asterisk.getInstance().parseResponse(responseText);
		};
		
	}
	
	// Login Job
	function Login()
	{
		this.name = "Login";
		this.run = function(sequence, phoneNo)
		{
			logging.getInstance().njdebug("job", "login");
			var url = job.genURL("Login");
			var username = options.getInstance().getUsername();
			var password = options.getInstance().getPassword(username);
			asterisk.getInstance().setLoggedIn(false);
			
			logging.getInstance().njdebug("job", "Username: " + username);
			url += "&Username=" + username;
			url += "&Secret=" + password;
			url += "&Events=call";
	
			this.status = function()
			{
				logging.getInstance().njlog("Authenticating");
			};
	
			// dialstatus.getInstance().updateStatus("Authenticating");
	
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
				asterisk.getInstance().setLoggedIn(false);
				util.showError(result.response, result.message);
				abort = true;
			}
			else
			{
				asterisk.getInstance().setLoggedIn(true);
				//asterisk.getInstance().updateState("Login successful.");
				logging.getInstance().njlog("Login successful.");
			}
			return abort;
		};
	
		this.parseResponse = function(responseText)
		{
			return asterisk.getInstance().parseResponse(responseText);
		};
		
	}
	
	// Logoff Job
	function Logoff()
	{
		this.name = "Logoff";
		
		this.run = function(sequence, phoneNo)
		{
			var url = job.genURL("Logoff");
			asterisk.getInstance().setLoggedIn(false);
	
			this.status = function()
			{
				logging.getInstance().njlog("Logging off");
			};
	
			dialstatus.getInstance().updateStatus("Logging Off");
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
				util.showError(result.response, result.message);
				abort = true;
			}
			return abort;
		};
	
		this.parseResponse = function(responseText)
		{
			return asterisk.getInstance().parseResponse(responseText);
		};
		
	
	
	// Returns the url to execute when the user clicks on the url
	function genURL(command)
	{
		logging.getInstance().njdebug("job", "genURL(command)=" + command);
		var url = null;
	
		var protocol = "http://";
		
		var useHTTPS = options.getInstance().getBoolValue("useHttps");
		if (useHTTPS === true)
			protocol = "https://";
		
		var host = options.getInstance().getValue("host");
		var port = options.getInstance().getValue("port");
		var httpPrefix = options.getInstance().getValue("httpPrefix");
		// The asterisk appliance doesn't allow a prefix so we need to support a null prefix
		if (httpPrefix === null || util.trim(httpPrefix).length === 0)
			httpPrefix = "/";
		else
			httpPrefix = "/" + util.trim(httpPrefix) + "/";
		url = protocol + host + ":" + port + httpPrefix + "mxml?action=" + command;
	
		logging.getInstance().njdebug("job", "genURL ret=" + url);
		return url;
	}
	
	function toString(jobs)
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

	return 
	{
		Dial : Dial,
		Wait : Wait,
		Answer : Answer,
		HangupAction : HangupAction,
		Ping : Ping,
		Status : Status,
		Complete : Complete,
		Login : Login,
		Logoff : Logoff
	};
		
} )( window );
