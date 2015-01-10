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

theApp.event =
{

eventFactory: function (xmlDoc)
{
	var events = new Array();
	var j = 0;

	theApp.logging.njdebug("event.low", "eventFactory called");

	var genericElement = xmlDoc.getElementsByTagName("generic");

	// Check each array instance for an event.
	// We may end up with multiple events.
	for ( var i = 0; i < genericElement.length; i++)
	{
		if (genericElement[i] != null && genericElement[i].getAttribute("event") != null)
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
//				theApp.logging.njdebug("event.low", "Unknown event=" + eventType);
			
			if (event != null)
				events[j++] = event;
		}
	}
	
	if (theApp.prefs.getBoolValue("enableDebugging") == true)
	{
		theApp.logging.njdebug("event.low", events.length + " events found");
		for (var i = 0; i < events.length; i++)
		{
			theApp.logging.njdebug("event.low", "events[" + i + "]=" + events[i].name);
		}
	}

	return events;
},
 
// <response type='object' id='unknown'><generic event='Newchannel'
// privilege='call,all' channel='SIP/115-08239ca8' state='Down'
// calleridnum='&lt;unknown&gt;' calleridname='&lt;unknown&gt;'
// uniqueid='1224888384.18' /></response>
// <response type='object' id='unknown'><generic event='WaitEventComplete'
// /></response>

NewChannel: function (response)
{
	this.name = "NewChannel";
	
	this.channel = response.getAttribute("channel");


	this.state = response.getAttribute("ChannelStateDesc");
	
	// support for older 1.4 headers
	if (this.state == undefined || this.state == null)
		this.state = response.getAttribute("state");
	
	this.uniqueid = response.getAttribute("uniqueid");
	this.calleridname = response.getAttribute("calleridname");
	this.calleridnum = response.getAttribute("calleridnum");
	

	this.apply = function(asterisk)
	{
		
		if (theApp.util.isLocalChannel(this.channel))
		{
			theApp.logging.njdebug("event.low", "Applying Event=" + this.name + " channel=" + this.channel + " state=" + this.state);
			theApp.logging.njdebug("event.high", "extractChannel=" + theApp.util.extractChannel(this.channel).toLowerCase());
			theApp.logging.njdebug("event.high", "getLocalChannel()=" + theApp.util.getLocalChannel().toLowerCase());
			asterisk.setChannel(this.channel);
			
			if (this.state == "Down")
				asterisk.updateState("Ringing: " + theApp.prefs.getValue("extension"));
			else
				asterisk.updateState(this.state);
		}
		
		
		if (asterisk.isRemoteChannel(this.channel))
		{
			theApp.logging.njdebug("event.high", "NewChannel received for Remote channel=" + this.channel + " state=" + this.state);
			asterisk.updateState(this.state);
		}
	
	};
},

WaitEventComplete: function (response)
{
	this.name = "WaitEventComplete";

	this.apply = function(asterisk)
	{
	};
},


/* New in 1.6. Replaces Link and Unlink.
 * we just chain to the old functions once we determine whether
 * its a link or unlink
 */
Bridge: function (response)
{
	this.name = "Bridge";
	var bridgestate = response.getAttribute("bridgestate");

	this.apply = function(asterisk)
	{	
		if (bridgestate == "Link")
		{
			var event = new theApp.event.Link(response);
			event.apply(asterisk);
		}
		else 
		{
			var event = new theApp.event.Unlink(response);
			event.apply(asterisk);
		}
	};
	
},

/*
<generic event='Link' privilege='call,all' 
channel1='SIP/215-20e565b8' 
channel2='IAX2/test-5226' 
uniqueid1='1236159644.511' 
uniqueid2='1236159646.512' 
callerid1='' 
callerid2='0438428038' />
 */
Link: function (response)
{
	this.name = "Link";
	this.channel = response.getAttribute("channel1");
	
	this.remoteChannel = response.getAttribute("channel2");
	this.uniqueid = response.getAttribute("uniqueid1");
	this.remoteUniqueid = response.getAttribute("uniqueid2");

	this.apply = function(asterisk)
	{
		theApp.logging.njdebug("event.low", "Applying Event=" + this.name + " channel=" + this.channel);
		
		// First check that the event is ours
		if (theApp.util.isLocalChannel(this.channel))
		{
			theApp.logging.njdebug("event.high", "Link event received.");

			asterisk.remoteChannel = this.remoteChannel;
			asterisk.updateState("Connected");
		}
	};
},


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
Unlink: function (response)
{
	this.name = "Unlink";
	this.channel = response.getAttribute("channel1");
	theApp.logging.njdebug("event.low", "channel=" + this.channel);
	
	this.remoteChannel = response.getAttribute("channel2");
	this.uniqueid = response.getAttribute("uniqueid1");
	this.remoteUniqueid = response.getAttribute("uniqueid2");

	this.apply = function(asterisk)
	{
		theApp.logging.njdebug("event.low", "Applying Event=" + this.name + " channel=" + this.channel);
		
		// First check that the event is ours
		if (theApp.util.isLocalChannel(this.channel))
		{
			theApp.logging.njdebug("event.high", "Unlink event received.");
			asterisk.remoteChannel = this.remoteChannel;
			asterisk.updateState("Disconnected");
			theApp.noojeeclick.resetIcon();
			window.setTimeout(function () {noojeeClick.asterisk.getInstance().updateState('');}, 3000);
		}
	};
},

Hangup: function (response)
{
	this.name = "Hangup";
	this.channel = response.getAttribute("channel");
	
	this.uniqueid = response.getAttribute("uniqueid");
	this.cause = response.getAttribute("cause");
	this.causeText = response.getAttribute("cause-txt");
	

	this.apply = function(asterisk)
	{
		theApp.logging.njdebug("event.low", "Applying Event=" + this.name + " channel=" + this.channel);
		
		if (theApp.util.isLocalChannel(this.channel))
		{
			theApp.logging.njdebug("event.high", "Hangup event received for channel=" + this.channel + " cause=" + this.causeText);
			asterisk.cause = this.cause;
			asterisk.causeText = this.causeText;
/*			if (asterisk.isRemoteDialCommenced())
				asterisk.updateState("Hangup: " + asterisk.dialing);
			else
				asterisk.updateState("Hangup: " + theApp.prefs.getValue("extension"));
*/
			asterisk.updateState("Disconnected");
			theApp.noojeeclick.resetIcon();
			window.setTimeout(function () {noojeeClick.asterisk.getInstance().updateState('');}, 3000);
		}
	
	};
},


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

DialEvent: function (response)
{
	this.name = "DialEvent";
	this.channel = response.getAttribute("channel");

	// asterisk 1.6 changed to channel, to support 1.4 we check for the old 'source' attribute.
	if (this.channel == undefined || this.channel == null)
		this.channel = response.getAttribute("source");



	this.remoteChannel = response.getAttribute("destination");

	this.uniqueid = response.getAttribute("UniqueID");
	// Asterisk 1.4 support
	if (this.uniqueid == undefined || this.uniqueid == null)
		this.uniqueid = response.getAttribute("srcuniqueid");
		
	this.remoteUniqueid = response.getAttribute("destuniqueid");

	this.apply = function(asterisk)
	{
		theApp.logging.njdebug("event.low", "Applying Event=" + this.name + " channel=" + this.channel + " remoteChannel=" + this.remoteChannel);
		
		// First check that the event is ours
		if (theApp.util.isLocalChannel(this.channel))
		{
			asterisk.remoteChannel = this.remoteChannel;
			asterisk.setRemoteDialCommenced(true);
			asterisk.updateState("Dialing: " + asterisk.dialing );
		}
	};
},

Newstate: function (response)
{
	this.name = "NewState";
	this.channel = response.getAttribute("channel");
	
	this.uniqueid = response.getAttribute("uniqueid");
	
	this.state = response.getAttribute("ChannelStateDesc");
	
	// support for older 1.4 headers
	if (this.state == undefined || this.state == null)
		this.state = response.getAttribute("state");
		
	this.calleridname = response.getAttribute("calleridname");
	this.callerid = response.getAttribute("callerid");

	
	this.apply = function(asterisk)
	{
		theApp.logging.njdebug("event.low", "Applying Event=" + this.name + " channel=" + this.channel + " state=" + this.state);

		if (this.channel == asterisk.remoteChannel)
		{
			theApp.logging.njdebug("event.high", "NewState updated asterisk state to " + asterisk.state);
			asterisk.updateState(this.state);
		}
	};
},

Newcallerid: function (response)
{
	this.name = "Newcallerid";
	this.channel = response.getAttribute("channel");
	
	this.uniqueid = response.getAttribute("uniqueid");
	this.calleridname = response.getAttribute("calleridname");
	
	this.callerid = response.getAttribute("calleridNum");
	// 1.4 support
	if (this.callerid == undefined || this.callerid == null)
		this.callerid = response.getAttribute("callerid");
	
	
	this.apply = function(asterisk)
	{
		theApp.logging.njdebug("event.low", "Applying Event=" + this.name + " channel=" + this.channel);
		if (this.channel == asterisk.remoteChannel)
		{
			theApp.logging.njdebug("event.high", "Newcallerid event received for channel=" + this.channel + " callerid=" + this.callerid);

			asterisk.calleridname = this.calleridname;
			asterisk.callerid = this.callerid;
		}
	
	};
},

};

}});