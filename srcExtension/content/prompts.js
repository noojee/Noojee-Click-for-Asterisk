
var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                 .getService(Components.interfaces.nsIPromptService);


function njAlert(msg)
{
	prompts.alert(window, "Noojee Click", msg);
	
}

function njPrompt(msg, defaultValue)
{
	var input = {value: defaultValue};
	var check = {value: false};
	var result = prompts.prompt(window, "Noojee Click", msg, input, null, check);
	// input.value is the string user entered
	// result - whether user clicked OK (true) or Cancel

	return {value: input.value, OK:result};
}