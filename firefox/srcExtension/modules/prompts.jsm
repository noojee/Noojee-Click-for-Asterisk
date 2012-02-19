var EXPORTED_SYMBOLS = ["prompt"];

Components.utils.import("resource://noojeeclick/util.jsm");

var service = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                 .getService(Components.interfaces.nsIPromptService);

var prompt = new Prompt();

function Prompt ()
{
	this.window = null;
	
	this.init = function(window)
	{
		this.window = window;
				
	}

	this.alert = function(msg)
	{
		service.alert(this.window, "Noojee Click", msg);
	}

	this.prompt = function(msg, defaultValue)
	{
		var input = {value: defaultValue};
		var check = {value: false};
		var result = service.prompt(this.window, "Noojee Click", msg, input, null, check);
		// input.value is the string user entered
		// result - whether user clicked OK (true) or Cancel
	
		return {value: input.value, OK:result};
	}

	this.error = function(response, message)
	{
		njlog("prompt.error r=" + response + " m=" + message);
		this.alert(message);
	}
	
	this.exception = function(method, e)
	{
		njdebug("Exception caught in method '" + method + "' " + e);
		var message = "An exeption occured in method '" + method + "' " + e.name + ". Error description: " + e.description
		        + ". Error number: " + e.number + ". Error message: " + e.message;
		njlog(message);
	
		njdebug(stacktrace());
		this.alert(message);
	}
	
}