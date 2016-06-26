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



// Singleton Event factory
var event = ( function( window, undefined ) 
{
	var instance = null;
	  
	// revealing module pattern that handles initialization of our new module
	function initializeNewModule() 
	{
		function eventFactory(xmlDoc)
		{
			var events = [];
			var j = 0;
		
			logging.getInstance().njdebug("event.low", "eventFactory called");
		
			var genericElement = xmlDoc.getElementsByTagName("generic");
		
			// Check each array instance for an event.
			// We may end up with multiple events.
			for ( var i = 0; i < genericElement.length; i++)
			{
				if (genericElement[i] !== null && genericElement[i].getAttribute("event") !== null)
				{
					var event = null;
					var eventType = genericElement[i].getAttribute("event");
					
					if ("NewChannel".toLowerCase() == eventType.toLowerCase())
					{
						event = new this.NewChannel(genericElement[i]);
					}
					else if ("Dial".toLowerCase() == eventType.toLowerCase())
					{
						event = new this.DialEvent(genericElement[i]);
					}
					else if ("Newcallerid".toLowerCase() == eventType.toLowerCase())
					{
						event = new this.Newcallerid(genericElement[i]);
					}
					else if ("Newstate".toLowerCase() == eventType.toLowerCase())
					{
						event = new this.Newstate(genericElement[i]);
					}
					else if ("WaitEventComplete".toLowerCase() == eventType.toLowerCase())
					{
						event = new this.WaitEventComplete(genericElement[i]);
					}
					else if ("Bridge".toLowerCase() == eventType.toLowerCase())
					{
						event = new this.Bridge(genericElement[i]);
					}
					// 1.4 support, now replaced by Bridge
					else if ("Link".toLowerCase() == eventType.toLowerCase())
					{
						event = new this.Link(genericElement[i]);
					}
					// 1.4 support, now replaced by Bridge
					else if ("Unlink".toLowerCase() == eventType.toLowerCase())
					{
						event = new this.Unlink(genericElement[i]);
					}
					else if ("Hangup".toLowerCase() == eventType.toLowerCase())
					{
						event = new this.Hangup(genericElement[i]);
					}
		//			else
		//				logging.getInstance().njdebug("event.low", "Unknown event=" + eventType);
					
					if (event !== null)
						events[j++] = event;
				}
			}
			
			if (options.getInstance().getBoolValue("enableDebugging") === true)
			{
				logging.getInstance().njdebug("event.low", events.length + " events found");
				for (var k = 0; k < events.length; k++)
				{
					logging.getInstance().njdebug("event.low", "events[" + k + "]=" + events[k].name);
				}
			}
		
			return events;
		}
		 
		// <response type='object' id='unknown'><generic event='Newchannel'
		// privilege='call,all' channel='SIP/115-08239ca8' state='Down'
		// calleridnum='&lt;unknown&gt;' calleridname='&lt;unknown&gt;'
		// uniqueid='1224888384.18' /></response>
		// <response type='object' id='unknown'><generic event='WaitEventComplete'
		// /></response>
		
		function NewChannel(response)
		{
			this.name = "NewChannel";
			
			this.channel = response.getAttribute("channel");
		
		
			this.state = response.getAttribute("ChannelStateDesc");
			
			// support for older 1.4 headers
			if (this.state === undefined || this.state === null)
				this.state = response.getAttribute("state");
			
			this.uniqueid = response.getAttribute("uniqueid");
			this.calleridname = response.getAttribute("calleridname");
			this.calleridnum = response.getAttribute("calleridnum");
			
		
			this.apply = function(asterisk)
			{
				
				if (util.isLocalChannel(this.channel))
				{
					logging.getInstance().njdebug("event.low", "Applying Event=" + this.name + " channel=" + this.channel + " state=" + this.state);
					logging.getInstance().njdebug("event.high", "extractChannel=" + util.extractChannel(this.channel).toLowerCase());
					logging.getInstance().njdebug("event.high", "getLocalChannel()=" + util.getLocalChannel().toLowerCase());
					asterisk.setChannel(this.channel);
					
					if (this.state == "Down")
						asterisk.updateState("Ringing: " + options.getInstance().getValue("extension"));
					else
						asterisk.updateState(this.state);
				}
				
				
				if (asterisk.isRemoteChannel(this.channel))
				{
					logging.getInstance().njdebug("event.high", "NewChannel received for Remote channel=" + this.channel + " state=" + this.state);
					asterisk.updateState(this.state);
				}
			
			};
		}
		
		function WaitEventComplete(response)
		{
			this.name = "WaitEventComplete";
		
			this.apply = function(asterisk)
			{
			};
		}
		
		
		/* New in 1.6. Replaces Link and Unlink.
		 * we just chain to the old functions once we determine whether
		 * its a link or unlink
		 */
		function Bridge(response)
		{
			this.name = "Bridge";
			var bridgestate = response.getAttribute("bridgestate");
		
			this.apply = function(asterisk)
			{	
				if (bridgestate == "Link")
				{
					var event = new event.Link(response);
					event.apply(asterisk);
				}
				else 
				{
					var unlinkEvent = new event.Unlink(response);
					unlinkEvent.apply(asterisk);
				}
			};
			
		}
		
		/*
		<generic event='Link' privilege='call,all' 
		channel1='SIP/215-20e565b8' 
		channel2='IAX2/test-5226' 
		uniqueid1='1236159644.511' 
		uniqueid2='1236159646.512' 
		callerid1='' 
		callerid2='0438428038' />
		 */
		function Link(response)
		{
			this.name = "Link";
			this.channel = response.getAttribute("channel1");
			
			this.remoteChannel = response.getAttribute("channel2");
			this.uniqueid = response.getAttribute("uniqueid1");
			this.remoteUniqueid = response.getAttribute("uniqueid2");
		
			this.apply = function(asterisk)
			{
				logging.getInstance().njdebug("event.low", "Applying Event=" + this.name + " channel=" + this.channel);
				
				// First check that the event is ours
				if (util.isLocalChannel(this.channel))
				{
					logging.getInstance().njdebug("event.high", "Link event received.");
		
					asterisk.remoteChannel = this.remoteChannel;
					asterisk.updateState("Connected");
				}
			};
		}
		
		
		/*
		<generic event='Unlink' 
		privilege='call,all' 
		channel1='SIP/215-20e565b8' 
		channel2='IAX2/test-5226' 
		uniqueid1='1236159644.511' 
		uniqueid2='1236159646.512' 
		callerid1='' 
		callerid2='0438428038'/>
		 */
		function Unlink(response)
		{
			this.name = "Unlink";
			this.channel = response.getAttribute("channel1");
			logging.getInstance().njdebug("event.low", "channel=" + this.channel);
			
			this.remoteChannel = response.getAttribute("channel2");
			this.uniqueid = response.getAttribute("uniqueid1");
			this.remoteUniqueid = response.getAttribute("uniqueid2");
		
			this.apply = function(asterisk)
			{
				logging.getInstance().njdebug("event.low", "Applying Event=" + this.name + " channel=" + this.channel);
				
				// First check that the event is ours
				if (util.isLocalChannel(this.channel))
				{
					logging.getInstance().njdebug("event.high", "Unlink event received.");
					asterisk.remoteChannel = this.remoteChannel;
					asterisk.updateState("Disconnected");
					noojeeclick.resetIcon();
					window.setTimeout(function () {noojeeClick.asterisk.getInstance().updateState('');}, 3000);
				}
			};
		}
		
		function Hangup(response)
		{
			this.name = "Hangup";
			this.channel = response.getAttribute("channel");
			
			this.uniqueid = response.getAttribute("uniqueid");
			this.cause = response.getAttribute("cause");
			this.causeText = response.getAttribute("cause-txt");
			
		
			this.apply = function(asterisk)
			{
				logging.getInstance().njdebug("event.low", "Applying Event=" + this.name + " channel=" + this.channel);
				
				if (util.isLocalChannel(this.channel))
				{
					logging.getInstance().njdebug("event.high", "Hangup event received for channel=" + this.channel + " cause=" + this.causeText);
					asterisk.cause = this.cause;
					asterisk.causeText = this.causeText;
		/*			if (asterisk.isRemoteDialCommenced())
						asterisk.updateState("Hangup: " + asterisk.dialing);
					else
						asterisk.updateState("Hangup: " + options.getInstance().getValue("extension"));
		*/
					asterisk.updateState("Disconnected");
					noojeeclick.resetIcon();
					window.setTimeout(function () {noojeeClick.asterisk.getInstance().updateState('');}, 3000);
				}
			
			};
		}
		
		
		/*
		 <generic event='Dial' 
		 	privilege='call,all' 
		 	source='SIP/215-082aa768' 
		 	destination='IAX2/test-16139' 
		 	callerid='&lt;unknown&gt;' 
		 	calleridname='0438428038-NoojeeClick' 
		 	srcuniqueid='1236160327.521' 
		 	destuniqueid='1236160329.522' /></response>
		 */
		
		function DialEvent(response)
		{
			this.name = "DialEvent";
			this.channel = response.getAttribute("channel");
		
			// asterisk 1.6 changed to channel, to support 1.4 we check for the old 'source' attribute.
			if (this.channel === undefined || this.channel === null)
				this.channel = response.getAttribute("source");
		
		
		
			this.remoteChannel = response.getAttribute("destination");
		
			this.uniqueid = response.getAttribute("UniqueID");
			// Asterisk 1.4 support
			if (this.uniqueid === undefined || this.uniqueid === null)
				this.uniqueid = response.getAttribute("srcuniqueid");
				
			this.remoteUniqueid = response.getAttribute("destuniqueid");
		
			this.apply = function(asterisk)
			{
				logging.getInstance().njdebug("event.low", "Applying Event=" + this.name + " channel=" + this.channel + " remoteChannel=" + this.remoteChannel);
				
				// First check that the event is ours
				if (util.isLocalChannel(this.channel))
				{
					asterisk.remoteChannel = this.remoteChannel;
					asterisk.setRemoteDialCommenced(true);
					asterisk.updateState("Dialing: " + asterisk.dialing );
				}
			};
		}
		
		function Newstate(response)
		{
			this.name = "NewState";
			this.channel = response.getAttribute("channel");
			
			this.uniqueid = response.getAttribute("uniqueid");
			
			this.state = response.getAttribute("ChannelStateDesc");
			
			// support for older 1.4 headers
			if (this.state === undefined || this.state === null)
				this.state = response.getAttribute("state");
				
			this.calleridname = response.getAttribute("calleridname");
			this.callerid = response.getAttribute("callerid");
		
			
			this.apply = function(asterisk)
			{
				logging.getInstance().njdebug("event.low", "Applying Event=" + this.name + " channel=" + this.channel + " state=" + this.state);
		
				if (this.channel == asterisk.remoteChannel)
				{
					logging.getInstance().njdebug("event.high", "NewState updated asterisk state to " + asterisk.state);
					asterisk.updateState(this.state);
				}
			};
		},
		
		function Newcallerid(response)
		{
			this.name = "Newcallerid";
			this.channel = response.getAttribute("channel");
			
			this.uniqueid = response.getAttribute("uniqueid");
			this.calleridname = response.getAttribute("calleridname");
			
			this.callerid = response.getAttribute("calleridNum");
			// 1.4 support
			if (this.callerid === undefined || this.callerid === null)
				this.callerid = response.getAttribute("callerid");
			
			
			this.apply = function(asterisk)
			{
				logging.getInstance().njdebug("event.low", "Applying Event=" + this.name + " channel=" + this.channel);
				if (this.channel == asterisk.remoteChannel)
				{
					logging.getInstance().njdebug("event.high", "Newcallerid event received for channel=" + this.channel + " callerid=" + this.callerid);
		
					asterisk.calleridname = this.calleridname;
					asterisk.callerid = this.callerid;
				}
			
			};
		}
		
		return 
		{
			eventFactory : eventFactory,
		};
		
	} // end initializeNewModule

	
	// handles the prevention of additional instantiations
	function getInstance() 
	{
		if( ! instance ) 
		{
			instance = new initializeNewModule();
		}
		return instance;
		}
	
	return 
	{
		getInstance : getInstance
	};

} )( window );
