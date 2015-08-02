noojeeClick.ns(function() 
{
	with (noojeeClick.LIB) 
	{
		theApp.prompts = 
		{

					njAlert : function(msg) {
						try {
							var iPrompt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
									.getService(Components.interfaces.nsIPromptService);
							iPrompt.alert(window, "Noojee Click", msg);
						} catch (e) {
							theApp.logging.njdebug("config",
									"Error trying to 'alert' message:" + msg
											+ " error:" + e);
						}

					},

					njPrompt : function(msg, defaultValue) {
						try {
							var iPrompt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
									.getService(Components.interfaces.nsIPromptService);

							var input = {
								value : defaultValue
							};
							var check = {
								value : false
							};
							var result = iPrompt.prompt(window, "Noojee Click",
									msg, input, null, check);
							// input.value is the string user entered
							// result - whether user clicked OK (true) or Cancel
						} catch (e) {
							theApp.logging.njdebug("config",
									"Error trying to 'prompt user' message:"
											+ msg + " error:" + e);
						}

						return {
							value : input.value,
							OK : result
						};
					}

				};

			}
		});