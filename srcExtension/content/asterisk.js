noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.asterisk =
{

gAsterisk: null,

authRequired: false,

getInstance: function ()
{
	if (this.gAsterisk == null)
	{
		this.gAsterisk = new this.Asterisk();
		this.gAsterisk.init();
	}
		
	return this.gAsterisk;
},

Asterisk: function ()
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
		theApp.util.njlog("initializing Asterisk");
		if (theApp.prefs.getBoolValue("enabled") == true)
		{ 
			var sequence = new theApp.sequence.Sequence( [ new theApp.job.Login(), new theApp.job.Wait(null) ], "", true);
			sequence.run();
		}
	}
	
	this.setLoggedIn = function (loggedIn)
	{
		this.loggedIn = loggedIn;
	}

	this.dial = function(phoneNo)
	{
		theApp.util.njdebug( "asterisk", "Asterisk.dial=" + phoneNo);
		
		// TODO: only set the lastDialed when we successfully dial
		theApp.prefs.setValue("lastDialed", phoneNo);
		
		this.remoteDialCommenced = false;
		this.dialing = phoneNo;
		this.channel = null;
		this.remoteChannel = null;
		this.state = null;	
		
		this.inLocalDial = true;
		
		var dialSequence = null;
		
		if (this.loggedIn)
			dialSequence = new theApp.sequence.Sequence( [ new theApp.job.Dial(), new theApp.job.Complete() ], phoneNo, false);
		else
			dialSequence = new theApp.sequence.Sequence( [ new theApp.job.Login(), new theApp.job.Dial(), new theApp.job.Complete() ], phoneNo, false);
			
		dialSequence.run();
	}

	this.answer = function()
	{
		theApp.util.njdebug("asterisk", "Asterisk.answer");
		
		this.remoteDialCommenced = false;
		this.state = null;	
		
		var answerSequence;
		if (this.loggedIn)
			answerSequence = new theApp.sequence.Sequence( [ new theApp.job.Answer(), new theApp.job.Complete() ], this.remoteChannel, false);
		else
			answerSequence = new theApp.sequence.Sequence( [ new theApp.job.Login(), new theApp.job.Answer(), new theApp.job.Complete() ], this.remoteChannel, false);
			
		answerSequence.run();
	}

	this.hangup = function()
	{
		theApp.util.njdebug("asterisk", "Asterisk.hangup called channel=" + theApp.asterisk.getInstance().channel);

		// Hangup the our extension
		var sequence = new theApp.sequence.Sequence( [ new theApp.job.HangupAction(theApp.asterisk.getInstance().channel), new theApp.job.Complete() ], "", false);
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
		var sequence = new theApp.sequence.Sequence( [ new theApp.sequence.Logoff(), new theApp.sequence.Complete() ], "", false);
		sequence.run();
	}

	this.processEvent = function(events)
	{
		theApp.util.njdebug("asterisk", "Asterisk.processEventCalled");
		// <response type='object' id='unknown'><generic event='Newchannel'
		// privilege='call,all' channel='SIP/115-08239ca8' state='Down'
		// calleridnum='&lt;unknown&gt;' calleridname='&lt;unknown&gt;'
		// uniqueid='1224888384.18' /></response>

		theApp.util.njdebug("asterisk", events.length + " events found");
		for (var i = 0; i < events.length; i++)
		{
			theApp.util.njdebug("asterisk", "applying events[i]=" + theApp.util.getObjectClass(events[i]));
			events[i].apply(theApp.asterisk.getInstance());
		}
	}
	
	this.updateState = function(state)
	{
		this.state = state;
		theApp.dialstatus.getInstance().updateStatus(state);
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

				theApp.util.njdebug("asterisk", "Parsing:" + responseText);
				var parser = new DOMParser();
				xmlDoc = parser.parseFromString(responseText, "application/xhtml+xml");

				var serverType = theApp.prefs.getValue("serverType"); 
				if (serverType == theApp.noojeeclick.serverTypeList[0].type)
				{
					theApp.util.njdebug("asterisk", "running AstmanProxy");
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
				else if (serverType == theApp.noojeeclick.serverTypeList[1].type 
				|| serverType == theApp.noojeeclick.serverTypeList[2].type)
				{
					theApp.util.njdebug("asterisk", "running AJAM or NJVision");
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
					var events = theApp.event.eventFactory(xmlDoc);
					if (events != null && events.length > 0)
					{
						theApp.asterisk.getInstance().processEvent(events);
					}
				}


			}
		}
		catch (e)
		{
			theApp.util.njerror(e);
			theApp.util.showException("parseResponse", e);
		}
		return result;
	}

	// Tests if the given channel (from an event usually) matches the 
	// current remote  channel.
	this.isRemoteChannel = function (channel)
	{
		var matches = false;
		if (this.remoteChannel != null)
			matches = theApp.util.extractChannel(channel).toLowerCase() == theApp.util.extractChannel(this.remoteChannel).toLowerCase();
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



}

}});