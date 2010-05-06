
noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.prompts =
{



njAlert: function (msg)
{
	var iPrompt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                 .getService(Components.interfaces.nsIPromptService);
	iPrompt.alert(window, "Noojee Click", msg);
	
},

njPrompt: function (msg, defaultValue)
{
	var iPrompt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                 .getService(Components.interfaces.nsIPromptService);

	var input = {value: defaultValue};
	var check = {value: false};
	var result = iPrompt.prompt(window, "Noojee Click", msg, input, null, check);
	// input.value is the string user entered
	// result - whether user clicked OK (true) or Cancel

	return {value: input.value, OK:result};
}


}

}});