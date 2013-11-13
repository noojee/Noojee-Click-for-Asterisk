// Shared module between all firefox instances so that we only have a single connection
// to asterisk. This reduces traffic.

var EXPORTED_SYMBOLS = ["gAsterisk"];

Components.utils.import("resource://noojeeclick/constants.jsm");
Components.utils.import("resource://noojeeclick/util.jsm");
Components.utils.import("resource://noojeeclick/prefs.jsm");
Components.utils.import("resource://noojeeclick/statusbar.jsm");
Components.utils.import("resource://noojeeclick/sequence.jsm");
Components.utils.import("resource://noojeeclick/prompts.jsm");
Components.utils.import("resource://noojeeclick/job.jsm");
Components.utils.import("resource://noojeeclick/event.jsm");


var gAsterisk = null;

// Login and begin monitoring events
if (gAsterisk == null)
{
	gAsterisk = new Asterisk();
	
}

function Asterisk()
{
	this.serverType = serverTypeList[0].type;
	this.dialing = null; 		// the phone no. which is currently being dialed.
	this.remoteDialCommenced = false; // During a call tracks if we have started dialing the remote end.
	this.channel = null;		// channel attached to local phone
	this.remoteChannel = null;	// channel attached to remote phone
	this.state = null;
	this.callerid = null;
	this.calleridname = null;
	this.calleridnum = null;
	this.uniqueid = null;
	this.loggedIn = false;
	this.inLocalDial = false; // Used when a dial is in progress 
								// until the local dial is complete 
								// i.e. the local user answers.
	this. xmlHttpRequest = null;
	this.domParser = null;
	
	this.init = function(xmlHttpRequest, domParser)
	{
		this.xmlHttpRequest = xmlHttpRequest;
		this.domParser = domParser;
		
		njdebug("error", "initializing Asterisk");
		if (getBoolValue("enabled") == true)
		{ 
			var sequence = new Sequence(this, this.xmlHttpRequest, [ new Login(this), new Wait(this, null) ], "", true);
			sequence.run();
		}
	}
	
	this.setLoggedIn = function (loggedIn)
	{
		this.loggedIn = loggedIn;
	}

	this.dial = function(phoneNo)
	{
		njdebug( "asterisk", "Asterisk.dial=" + phoneNo);
		
		// TODO: only set the lastDialed when we successfully dial
		setValue("lastDialed", phoneNo);
		
		this.remoteDialCommenced = false;
		this.dialing = phoneNo;
		this.channel = null;
		this.remoteChannel = null;
		this.state = null;	
		
		this.inLocalDial = true;
		
		var dialSequence = dialSequence = new Sequence(this, this.xmlHttpRequest,  [ new Dial(this), new Complete(this) ], phoneNo, false);
		
		// wrap the dial sequence in a wait sequence so we can monitor the call progress.
		var jobWait = new Wait(this, dialSequence);

		// Finally prepend a login if we are not currently logged in.
		// You can't monitor the login (and its not required) as you can't run
		// waitevent until you have logged in.
		if (this.loggedIn)
				dialSequence = new Sequence(this, this.xmlHttpRequest, [ jobWait ], "", true);
			else
				dialSequence = new Sequence(this, this.xmlHttpRequest,  [ new Login(this), jobWait ], "", true);
			
		dialSequence.run();
	}

	this.answer = function()
	{
		njdebug("asterisk", "Asterisk.answer");
		
		this.remoteDialCommenced = false;
		this.state = null;	
		
		var answerSequence;
		if (this.loggedIn)
			answerSequence = new Sequence(this, this.xmlHttpRequest,  [ new Answer(this), new Complete(this) ], this.remoteChannel, false);
		else
			answerSequence = new Sequence(this, this.xmlHttpRequest,  [ new Login(this), new Answer(this), new Complete(this) ], this.remoteChannel, false);
			
		answerSequence.run();
	}

	this.hangup = function()
	{
		njdebug("asterisk", "Asterisk.hangup called channel=" + gAsterisk.channel);

		// Hangup the our extension
		var sequence = new Sequence(this, this.xmlHttpRequest,  [ new HangupAction(this, gAsterisk.channel), new Complete() ], "", false);
		sequence.run();

		this.channel = null;
		this.remoteChannel = null;
		this.state = null;
		this.inLocalDial = false; // Mark the dial is no longer is progress so
									// we can ignore the 'originate failed' message that occurs if we 
									// cancel a dial by hanging up.
	}

	this.logoff = function()
	{
		var sequence = new Sequence(this, this.xmlHttpRequest,  [ new Logoff(this), new Complete(this) ], "", false);
		sequence.run();
	}

	this.processEvent = function(events)
	{
		njdebug("asterisk", "Asterisk.processEventCalled");
		// <response type='object' id='unknown'><generic event='Newchannel'
		// privilege='call,all' channel='SIP/115-08239ca8' state='Down'
		// calleridnum='&lt;unknown&gt;' calleridname='&lt;unknown&gt;'
		// uniqueid='1224888384.18' /></response>

		njdebug("asterisk", events.length + " events found");
		for (var i = 0; i < events.length; i++)
		{
			njdebug("asterisk", "applying events[i]=" + getObjectClass(events[i]));
			events[i].apply(gAsterisk);
		}
	}
	
	this.updateState = function(state)
	{
		this.state = state;
		statusbar.updateStatus(state);
	}
	
	this.parseResponse = function (responseText)
	{
		var result =
		{
		    response :"Error",
		    message :"No Response from Server"
		};
		try
		{
			var xmlDoc;
			if (this.domParser != "undefined")
			{
				var message = "none";
				var response;

				njdebug("asterisk", "Parsing:" + responseText);
				xmlDoc = this.domParser.parseFromString(responseText, "application/xhtml+xml");

				if (this.serverType == serverTypeList[0].type)
				{
					njdebug("asterisk", "running AstmanProxy");
					var tag = xmlDoc.getElementsByTagName("Response");
					if (tag[0] != null)
						response = tag[0].getAttribute("Value");
					tag = xmlDoc.getElementsByTagName("Message");
					if (tag[0] != null)
						message = tag[0].getAttribute("Value");

					result =
					{
					    response :response,
					    message :message
					};
				}
				else if (this.serverType == serverTypeList[1].type || this.serverType == serverTypeList[2].type)
				{
					njdebug("asterisk", "running AJAM or NJVision");
					var generic = xmlDoc.getElementsByTagName("generic");

					if (generic.length > 0)
					{
						response = generic[0].getAttribute("response");
						message = generic[0].getAttribute("message");
						result =
						{
						    response :response,
						    message :message
						};
					}
				}
				
				if (result.response == "Success")
				{
					// Check for any events
					var events = eventFactory(xmlDoc);
					if (events != null && events.length > 0)
					{
						gAsterisk.processEvent(events);
					}
				}


			}
			else
				njerror("asterisk", "No DOMParser found");
		}
		catch (e)
		{
			njerror("asterisk", e);
			prompt.exception("parseResponse", e);
		}
		return result;
	}

	// Tests if the given channel (from an event usually) matches the 
	// current remote  channel.
	this.isRemoteChannel = function (channel)
	{
		var matches = false;
		if (this.remoteChannel != null)
			matches = extractChannel(channel).toLowerCase() == extractChannel(this.remoteChannel).toLowerCase();
		return matches;
	}

	this.setRemoteDialCommenced = function(commenced)
	{
		this.remoteDialCommenced = commenced;
		
		// We have completed the local dial portion
		this.inLocalDial = false;
	}

	this.getRemoteChannelShortName = function()
	{
		return getChannelShortName(this.remoteChannel);
	}
	
	this.isRemoteDialCommenced = function()
	{
		return this.remoteDialCommenced;
	}
	
	this.isLocalDialInProgress = function()
	{
		return this.inLocalDial;
	}
	
	// Returns the url to execute when the user clicks on the url
	this.genURL = function(command)
	{
		njdebug("asterisk", "genURL(command)=" + command);
		var url;
	
		var protocol = "http://";
		
		var useHTTPS = getBoolValue("useHttps");
		if (useHTTPS == true)
			protocol = "https://";
		
		var host = getValue("host");
		var port = getValue("port");
		this.serverType = getValue("serverType");
		var httpPrefix = getValue("httpPrefix");
		// The asterisk appliance doesn't allow a prefix so we need to support a null prefix
		if (httpPrefix == null || trim(httpPrefix).length == 0)
			httpPrefix = "/";
		else
			httpPrefix = "/" + trim(httpPrefix) + "/";
		njdebug("asterisk", "serverType=" + this.serverType);
		if (this.serverType == serverTypeList[0].type)
			url = protocol + host + ":" + port + httpPrefix + "manager?action=" + command;
		else if (this.serverType == serverTypeList[1].type)
			url = protocol + host + ":" + port + httpPrefix + "mxml?action=" + command;
		else
		{
			njlog("Error: Unknown server type selected =" + this.serverType);
			prompt.error("Unknown server type selected =" + this.serverType);
		}
	
		njdebug("asterisk", "genURL ret=" + url);
		return url;
	}
	
}


