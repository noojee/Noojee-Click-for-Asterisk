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



// Asterisk is a Singleton.
var asterisk = ( function( window, undefined ) 
{
	var instance = null;
	var authRequired = false;

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

	// revealing module pattern that handles initialization of our new module
	function initializeNewModule() 
	{
			
		function init()
		{
			// We login on startup as this warns the user early in the process if we have any problems rather than
			// waiting for them to dial to find out.
			logging.getInstance().njlog("initializing Asterisk");
			var sequence = new sequence.Sequence( [ new job.Login(), new job.Wait(null) ], "", true);
			sequence.run();
		};
		
		function setLoggedIn (loggedIn)
		{
			this.loggedIn = loggedIn;
		};
		
		function setChannel (_channel)
		{
			this.channel = _channel;
			logging.getInstance().njdebug("asterisk", "Asterisk.channel set to " + this.channel);
		};
	
		function dial(phoneNo)
		{
			logging.getInstance().njdebug( "asterisk", "Asterisk.dial=" + phoneNo);
			
			// TODO: only set the lastDialed when we dialed successfully
			options.getInstance().setValue("lastDialed", phoneNo);
			
			this.remoteDialCommenced = false;
			this.dialing = phoneNo;
			logging.getInstance().njdebug("asterisk", "Asterisk.channel set to null");
			channel = null;
			this.remoteChannel = null;
			this.state = null;	
			
			this.inLocalDial = true;
			
			// Create the dial sequence
			var dialSequence = new sequence.Sequence( [ new job.Dial(), new job.Complete() ], phoneNo, false);
			
			// Nest it within a login sequence as we can't always tell if our asterisk session has timedout.
			// By always authing it doesn't matter if we have timed out.
			var loginSequence = new sequence.Sequence( [ new job.Login(), new job.Wait(dialSequence) ], "", true);
			loginSequence.run();
		};
	
		function answer()
		{
			logging.getInstance().njdebug("asterisk", "Asterisk.answer");
			
			this.remoteDialCommenced = false;
			this.state = null;	
			
			var answerSequence = new sequence.Sequence( [ new job.Answer(), new job.Complete() ], this.remoteChannel, false);
			var loginSequence = new sequence.Sequence( [ new job.Login(), new job.Wait(answerSequence) ], "", true);
				
			loginSequence.run();
		};
	
		function hangup()
		{
			logging.getInstance().njdebug("asterisk", "Asterisk.hangup called channel=" + channel);
	
			// Hangup our extension
			// we must logon in case our session has timed out since we first logged on.
			var hagupSequence = new sequence.Sequence( [ new job.HangupAction(this.channel), new job.Complete() ], "", false);
			var loginSequence = new sequence.Sequence( [ new job.Login(), new job.Wait(hagupSequence) ], "", true);
			loginSequence.run();
	
			logging.getInstance().njdebug("asterisk", "Asterisk.channel set to null");
			this.channel = null;
			this.remoteChannel = null;
			this.state = null;
			this.inLocalDial = false; // Mark the dial is no longer is progress so
										// we can ignore the 'originate failed' message that occurs if we 
										// cancel a dial by hanging up.
		};
	
		function logoff()
		{
			var sequence = new sequence.Sequence( [ new sequence.Logoff(), new sequence.Complete() ], "", false);
			sequence.run();
		};
	
		function processEvent(events)
		{
			logging.getInstance().njdebug("asterisk", "Asterisk.processEventCalled");
			// 
	
			logging.getInstance().njdebug("asterisk", events.length + " events found");
			for (var i = 0; i < events.length; i++)
			{
				events[i].apply(asterisk.getInstance());
			}
		};
		
		function updateState(state)
		{
			this.state = state;
			dialstatus.getInstance().updateStatus(state);
		};
		
		function parseResponse (responseText)
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
	
				logging.getInstance().njdebug("asterisk.low", "Parsing:" + responseText);
				var parser = new DOMParser();
				xmlDoc = parser.parseFromString(responseText, "application/xhtml+xml");
				
	
				logging.getInstance().njdebug("asterisk", "running AJAM or NJVision");
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
					logging.getInstance().njerror("Invalid AJAM Result: " + responseText + " : ignored as this could be an asterisk bug.");
				}
				
				
				if (result.response == "Success")
				{
					// Check for any events
					var events = event.eventFactory(xmlDoc);
					if (events !== null && events.length > 0)
					{
						asterisk.getInstance().processEvent(events);
					}
				}
	
			}
			catch (e)
			{
				logging.getInstance().njerror(e);
				util.showException("asterisk.parseResponse", e);
			}
			return result;
		};
	
		// Tests if the given channel (from an event usually) matches the 
		// current remote  channel.
		function isRemoteChannel (pChannel)
		{
			var matches = false;
			if (this.remoteChannel !== null)
				matches = util.extractChannel(pChannel).toLowerCase() == util.extractChannel(this.remoteChannel).toLowerCase();
			return matches;
		};
	
		function setRemoteDialCommenced(commenced)
		{
			this.remoteDialCommenced = commenced;
			
			// We have completed the local dial portion
			this.inLocalDial = false;
		};
		
		function isRemoteDialCommenced()
		{
			return this.remoteDialCommenced;
		};
		
		function isLocalDialInProgress()
		{
			return this.inLocalDial;
		};

		return 
		{
			init : init,
			setLoggedIn : setLoggedIn,
			setChannel : setChannel,
			answer : answer,
			hangup : hangup,
			logoff : logoff,
			isRemoteChannel : isRemoteChannel,
			setRemoteDialCommenced : setRemoteDialCommenced,
			isRemoteDialCommenced : isRemoteDialCommenced,
			isLocalDialInProgress : isLocalDialInProgress
		};
	
	} // end initializeNewModule

	
	// handles the prevention of additional instantiations
	function getInstance() 
	{
		if( ! instance ) 
		{
			instance = new initializeNewModule();
			instance.init();
		}
		return instance;
	}

	return 
	{
		getInstance : getInstance
	};

} )( window );
