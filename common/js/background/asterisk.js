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

theApp.asterisk =
{

gAsterisk: null,

authRequired: false,

autoAnswerList : [
      		    {
      		        manufacturer : "Aastra",
      		        header : "Call-Info: Answer-After=0"
      		    },
      		    {
      		        manufacturer : "GrandStream",
      		        header : "Call-Info:\\\\; answer-after=0"
      		    },
      		    {
      		        manufacturer : "Linksys",
      		        header : "Call-Info:\\\\; answer-after=0"
      		    },
      		    {
      		        manufacturer : "Polycom",
      		        header : "Alert-Info: Ring Answer"
      		    },
      		    {
      		        manufacturer : "Snom",
      		        header : "Call-Info:\\\\; answer-after=0"
      		    },
      		    {
      		        manufacturer : "Snom v8.7+",
      		        header : "Alert-Info: <http://www.ignored.com>\\;info=alert-autoanswer\\;delay=0"
      		    },
      		    {
      		        manufacturer : "Yealink",
      		        header : "Call-Info:\\\\; answer-after=0"
      		    } ],



getInstance: function ()
{
	if (this.gAsterisk == null)
	{
		this.gAsterisk = new this.Asterisk();
		this.gAsterisk.init();
	}
		
	return this.gAsterisk;
},

/**
 * Returns true if all of the needed asterisk configuration is available.
 */
isConfigured: function()
{
	var extension = theApp.prefs.getValue("extension");
	var context = theApp.prefs.getValue("context");
	var handsetType = theApp.prefs.getValue("handsetType");
	var host = theApp.prefs.getValue("host");
	var port = theApp.prefs.getValue("port");

	var isConfigured = true;
	if (extension == null || extension == "")
		isConfigured = false;

	if (context === null || context == "")
		isConfigured = false;

	if (handsetType === null || handsetType == "")
		isConfigured = false;

	if (host === null || host == "")
		isConfigured = false;

	if (port === null|| port == "")
		isConfigured = false;

	return isConfigured;

},


Asterisk: function ()
{
	// channel attached to local phone
	var channel = null;

	// the phone no. which is currently being dialed.
	this.dialing = null; 
	
	// During a call tracks if we have started dialing the remote end.
	this.remoteDialCommenced = false;
	
	// channel attached to remote phone
	this.remoteChannel = null;
	
	this.state = null;
	this.callerid = null;
	this.calleridname = null;
	this.calleridnum = null;
	this.uniqueid = null;
	
	// I've disabled this logic as the problem is that the we don't know what the http timeout
	// value is set to on the asterisk server (defaults to 60 seconds). So we don't
	// actually know when we have to login again. This way we just login every time 
	// we try to dial. For most people this is probably right as they won't dial more than 
	// once a minute so we have probably timed out.
	this.loggedIn = false; 
	
	// Used when a dial is in progress 
	// until the local dial is complete 
	// i.e. the local user answers.
	this.inLocalDial = false; 
	
	this.init = function()
	{
		// We login on startup as this warns the user early in the process if we have any problems rather than
		// waiting for them to dial to find out.
		theApp.logging.njlog("initializing Asterisk");
		var sequence = new theApp.sequence.Sequence( [ new theApp.job.Login(), new theApp.job.Wait(null) ], "", true);
		sequence.run();
	};
	
	this.setLoggedIn = function (loggedIn)
	{
		this.loggedIn = loggedIn;
	};
	
	this.setChannel = function (_channel)
	{
		this.channel = _channel;
		theApp.logging.njdebug("asterisk", "Asterisk.channel set to " + this.channel);
	};
	
	
	this.dial = function(phoneNo)
	{
		theApp.logging.njdebug( "asterisk", "Asterisk.dial=" + phoneNo);
		
		// TODO: only set the lastDialed when we dialed successfully
		theApp.prefs.setValue("lastDialed", phoneNo);
		
		this.remoteDialCommenced = false;
		this.dialing = phoneNo;
		theApp.logging.njdebug("asterisk", "Asterisk.channel set to null");
		channel = null;
		this.remoteChannel = null;
		this.state = null;	
		
		this.inLocalDial = true;
		
		// Create the dial sequence
		var dialSequence = new theApp.sequence.Sequence( [ new theApp.job.Dial(), new theApp.job.Complete() ], phoneNo, false);
		
		// Nest it within a login sequence as we can't always tell if our asterisk session has timedout.
		// By always authing it doesn't matter if we have timed out.
		var loginSequence = new theApp.sequence.Sequence( [ new theApp.job.Login(), new theApp.job.Wait(dialSequence) ], "", true);
		loginSequence.run();
	};

	this.answer = function()
	{
		theApp.logging.njdebug("asterisk", "Asterisk.answer");
		
		this.remoteDialCommenced = false;
		this.state = null;	
		
		var answerSequence = new theApp.sequence.Sequence( [ new theApp.job.Answer(), new theApp.job.Complete() ], this.remoteChannel, false);
		var loginSequence = new theApp.sequence.Sequence( [ new theApp.job.Login(), new theApp.job.Wait(answerSequence) ], "", true);
			
		loginSequence.run();
	};

	this.hangup = function()
	{
		theApp.logging.njdebug("asterisk", "Asterisk.hangup called channel=" + channel);

		// Hangup our extension
		// we must logon in case our session has timed out since we first logged on.
		var hagupSequence = new theApp.sequence.Sequence( [ new theApp.job.HangupAction(this.channel), new theApp.job.Complete() ], "", false);
		var loginSequence = new theApp.sequence.Sequence( [ new theApp.job.Login(), new theApp.job.Wait(hagupSequence) ], "", true);
		loginSequence.run();

		theApp.logging.njdebug("asterisk", "Asterisk.channel set to null");
		this.channel = null;
		this.remoteChannel = null;
		this.state = null;
		this.inLocalDial = false; // Mark the dial is no longer is progress so
									// we can ignore the 'originate failed' message that occurs if we 
									// cancel a dial by hanging up.
	};

	this.logoff = function()
	{
		var sequence = new theApp.sequence.Sequence( [ new theApp.sequence.Logoff(), new theApp.sequence.Complete() ], "", false);
		sequence.run();
	};

	this.processEvent = function(events)
	{
		theApp.logging.njdebug("asterisk", "Asterisk.processEventCalled");
		// 

		theApp.logging.njdebug("asterisk", events.length + " events found");
		for (var i = 0; i < events.length; i++)
		{
			events[i].apply(theApp.asterisk.getInstance());
		}
	};
	
	this.updateState = function(state)
	{
		this.state = state;
		theApp.dialstatus.getInstance().updateStatus(state);
	};
	
	this.parseResponse = function (responseText)
	{
		var result =
		{
		    response :"Error",
		    message :"Invalid Response from Server: " + responseText
		};
		try
		{
			var xmlDoc;
			var message = "none";
			var response = "none";

			theApp.logging.njdebug("asterisk.low", "Parsing:" + responseText);
			var parser = new DOMParser();
			xmlDoc = parser.parseFromString(responseText, "application/xhtml+xml");
			

			theApp.logging.njdebug("asterisk", "running AJAM or NJVision");
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
			else
			{
				result.response = "ignore";
				theApp.logging.njerror("Invalid AJAM Result: " + responseText + " : ignored as this could be an asterisk bug.");
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
		catch (e)
		{
			theApp.logging.njerror(e);
			theApp.util.showException("asterisk.parseResponse", e);
		}
		return result;
	};

	// Tests if the given channel (from an event usually) matches the 
	// current remote  channel.
	this.isRemoteChannel = function (pChannel)
	{
		var matches = false;
		if (this.remoteChannel != null)
			matches = theApp.util.extractChannel(pChannel).toLowerCase() == theApp.util.extractChannel(this.remoteChannel).toLowerCase();
		return matches;
	};

	this.setRemoteDialCommenced = function(commenced)
	{
		this.remoteDialCommenced = commenced;
		
		// We have completed the local dial portion
		this.inLocalDial = false;
	};
	
	this.isRemoteDialCommenced = function()
	{
		return this.remoteDialCommenced;
	};
	
	this.isLocalDialInProgress = function()
	{
		return this.inLocalDial;
	};
}



};

}});