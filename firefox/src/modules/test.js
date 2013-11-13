

var EXPORTED_SYMBOLS = ["test"];

var test = null;

if (test == null)
{
	test = new Test();
	test.init();
}


function Test()
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
	this.startDate = null;

	this.inLocalDial = false; // Used when a dial is in progress 
								// until the local dial is complete 
								// i.e. the local user answers.

	this.njdebug= function(module, msg)
	{
			var now = new Date();
			var hour = now.getHours();
			var min = now.getMinutes();
			var sec = now.getSeconds();
			var mil = now.getMilliseconds();
			consoleService.logStringMessage(hour + ":" + min + ":" + sec + ":" + mil+ " debug (" + module + "): " + msg);
	};

	this.init = function()
	{
		this.startDate = new Date();

		this.njdebug("Test", "Test.init called id=" + this.startDate);
	};
	
	this.hello = function()
	{
		this.njdebug("Test", "hello from Test id=" + this.startDate);
	};
	
}
	
