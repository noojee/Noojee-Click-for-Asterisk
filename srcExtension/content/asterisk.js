var gAsterisk = null;
var authRequired = false;

function Asterisk()
{
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
	
	this.init = function()
	{
		njlog("initializing Asterisk");
		if (getBoolValue("enabled") == true)
		{ 
			var sequence = new Sequence( [ new Login(), new Wait(null) ], "", true);
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
		
		var dialSequence = null;
		
		if (this.loggedIn)
			dialSequence = new Sequence( [ new Dial(), new Complete() ], phoneNo, false);
		else
			dialSequence = new Sequence( [ new Login(), new Dial(), new Complete() ], phoneNo, false);
			
		dialSequence.run();
	}

	this.answer = function()
	{
		njdebug("asterisk", "Asterisk.answer");
		
		this.remoteDialCommenced = false;
		this.state = null;	
		
		var answerSequence;
		if (this.loggedIn)
			answerSequence = new Sequence( [ new Answer(), new Complete() ], this.remoteChannel, false);
		else
			answerSequence = new Sequence( [ new Login(), new Answer(), new Complete() ], this.remoteChannel, false);
			
		answerSequence.run();
	}

	this.hangup = function()
	{
		njdebug("asterisk", "Asterisk.hangup called channel=" + gAsterisk.channel);

		// Hangup the our extension
		var sequence = new Sequence( [ new HangupAction(gAsterisk.channel), new Complete() ], "", false);
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
		var sequence = new Sequence( [ new Logoff(), new Complete() ], "", false);
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
		getStatusWindow().updateStatus(state);
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
			if (typeof (DOMParser) != "undefined")
			{
				var message = "none";
				var response;

				njdebug("asterisk", "Parsing:" + responseText);
				var parser = new DOMParser();
				xmlDoc = parser.parseFromString(responseText, "application/xhtml+xml");

				if (serverType == serverTypeList[0].type)
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
				else if (serverType == serverTypeList[1].type || serverType == serverTypeList[2].type)
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
		}
		catch (e)
		{
			njerror(e);
			showException("parseResponse", e);
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
	
	this.isRemoteDialCommenced = function()
	{
		return this.remoteDialCommenced;
	}
	
	this.isLocalDialInProgress = function()
	{
		return this.inLocalDial;
	}
}


