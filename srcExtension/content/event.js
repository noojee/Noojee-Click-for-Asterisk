
function eventFactory(xmlDoc)
{
	var events = new Array();
	var j = 0;

	njdebug("event.low", "eventFactory called");

	var genericElement = xmlDoc.getElementsByTagName("generic");
	njdebug("event.low", "generic=" + genericElement);

	// Check each array instance for an event.
	// We may end up with multiple events.
	for ( var i = 0; i < genericElement.length; i++)
	{
		if (genericElement[i] != null && genericElement[i].getAttribute("event") != null)
		{
			var event = null;
			var eventType = genericElement[i].getAttribute("event");
			
			if (NewChannel.name.toLowerCase() == eventType.toLowerCase())
			{
				event = new NewChannel(genericElement[i]);
			}
			else if ("Dial".toLowerCase() == eventType.toLowerCase())
			{
				event = new DialEvent(genericElement[i]);
			}
			else if (Newcallerid.name.toLowerCase() == eventType.toLowerCase())
			{
				event = new Newcallerid(genericElement[i]);
			}
			else if (Newstate.name.toLowerCase() == eventType.toLowerCase())
			{
				event = new Newstate(genericElement[i]);
			}
			else if (WaitEventComplete.name.toLowerCase() == eventType.toLowerCase())
			{
				event = new WaitEventComplete(genericElement[i]);
			}
			else if (Bridge.name.toLowerCase() == eventType.toLowerCase())
			{
				event = new Bridge(genericElement[i]);
			}
			// 1.4 support now replaced by Bridge
			else if (Link.name.toLowerCase() == eventType.toLowerCase())
			{
				event = new Link(genericElement[i]);
			}
			// 1.4 support now replaced by Bridge
			else if (Unlink.name.toLowerCase() == eventType.toLowerCase())
			{
				event = new Unlink(genericElement[i]);
			}
			else if (Hangup.name.toLowerCase() == eventType.toLowerCase())
			{
				event = new Hangup(genericElement[i]);
			}
			else
				njdebug("event.low", "Unknown event=" + eventType);
			
			if (event != null)
				events[j++] = event;
		}
	}
	
	if (getBoolValue("enableDebugging") == true)
	{
		njdebug("event.low", events.length + " events found");
		njdebug("event.low", "events=" + events);
		for (var i = 0; i < events.length; i++)
		{
			njdebug("event.low", "events[i]=" + getObjectClass(events[i]));
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
		
		if (isLocalChannel(this.channel))
		{
			njdebug("event.high", "NewChannel received for local channel=" + this.channel + " state=" + this.state);
			njdebug("event.high", "extractChannel=" + extractChannel(this.channel).toLowerCase());
			njdebug("event.high", "getLocalChannel()=" + getLocalChannel().toLowerCase());
			asterisk.channel = this.channel;
			
			if (this.state == "Down")
				asterisk.updateState("Ringing: " + getValue("extension"));
			else
				asterisk.updateState(this.state);
		}
		
		
		if (asterisk.isRemoteChannel(this.channel))
		{
			njdebug("event.high", "NewChannel received for Remote channel=" + this.channel + " state=" + this.state);
			asterisk.updateState(this.state);
		}
	
	}
}

function WaitEventComplete(response)
{
	njdebug("event.low", "WaitEventComplete received.");

	this.apply = function(asterisk)
	{
	}
}


/* New in 1.6. Replaces Link and Unlink.
 * we just chain to the old functions once we determine whether
 * its a link or unlink
 */
function Bridge(response)
{
	var bridgestate = response.getAttribute("bridgestate");

	this.apply = function(asterisk)
	{	
		if (bridgestate == "Link")
		{
			var event = new Link(response);
			event.apply(asterisk);
		}
		else 
		{
			var event = Unlink(response);
			event.apply(asterisk);
		}
	}
	
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
	this.channel = response.getAttribute("channel1");
	this.remoteChannel = response.getAttribute("channel2");
	this.uniqueid = response.getAttribute("uniqueid1");
	this.remoteUniqueid = response.getAttribute("uniqueid2");

	this.apply = function(asterisk)
	{
		// First check that the event is ours
		if (isLocalChannel(this.channel))
		{
			njdebug("event.high", "Link event received.");

			asterisk.remoteChannel = this.remoteChannel;
			asterisk.updateState("Connected");
		}
	}
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
	this.channel = response.getAttribute("channel1");
	this.remoteChannel = response.getAttribute("channel2");
	this.uniqueid = response.getAttribute("uniqueid1");
	this.remoteUniqueid = response.getAttribute("uniqueid2");

	this.apply = function(asterisk)
	{
		// First check that the event is ours
		if (isLocalChannel(this.channel))
		{
			njdebug("event.high", "Unlink event received.");
			asterisk.remoteChannel = this.remoteChannel;
			asterisk.updateState("Disconnected");
			resetIcon();
			setTimeout("gAsterisk.updateState('');", 3000);
		}
	}
}

function Hangup(response)
{
	this.channel = response.getAttribute("channel");
	this.uniqueid = response.getAttribute("uniqueid");
	this.cause = response.getAttribute("cause");
	this.causeText = response.getAttribute("cause-txt");
	

	this.apply = function(asterisk)
	{
		if (isLocalChannel(this.channel))
		{
			njdebug("event.high", "Hangup event received for channel=" + this.channel + " cause=" + this.causeText);
			asterisk.cause = this.cause;
			asterisk.causeText = this.causeText;
/*			if (asterisk.isRemoteDialCommenced())
				asterisk.updateState("Hangup: " + asterisk.dialing);
			else
				asterisk.updateState("Hangup: " + getValue("extension"));
*/
			asterisk.updateState("Disconnected");
			resetIcon();
			setTimeout("gAsterisk.updateState('');", 3000);
		}
	
	}
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
		njdebug("event.high", "Dial event received.");
		
		// First check that the event is ours
		if (isLocalChannel(this.channel))
		{
			asterisk.remoteChannel = this.remoteChannel;
			asterisk.setRemoteDialCommenced(true);
			asterisk.updateState("Dialing: " + asterisk.dialing );
		}
	}
}

function Newstate(response)
{
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
		njdebug("event.low", "Newstate event received for channel=" + this.channel + " state=" + this.state);

		if (this.channel == asterisk.remoteChannel)
		{
			njdebug("event.high", "NewState updated asterisk state to " + asterisk.state);
			asterisk.updateState(this.state);
		}
	}
}

function Newcallerid(response)
{
	this.channel = response.getAttribute("channel");
	this.uniqueid = response.getAttribute("uniqueid");
	this.calleridname = response.getAttribute("calleridname");
	
	this.callerid = response.getAttribute("calleridNum");
	// 1.4 support
	if (this.callerid == undefined || this.callerid == null)
		this.callerid = response.getAttribute("callerid");
	
	
	this.apply = function(asterisk)
	{
		if (this.channel == asterisk.remoteChannel)
		{
			njdebug("event.high", "Newcallerid event received for channel=" + this.channel + " callerid=" + this.callerid);

			asterisk.calleridname = this.calleridname;
			asterisk.callerid = this.callerid;
		}
	
	}
}



