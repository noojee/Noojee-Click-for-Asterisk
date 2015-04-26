noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.options =
{

	showOptions: function(e)
	{
		var optionsUrl = chrome.extension.getURL('background/options.html');

		/**
		 * Open or switch to an already open options.html.
		 */
		chrome.tabs.query({url: optionsUrl}, function(tabs) {
		    if (tabs.length) {
		        chrome.tabs.update(tabs[0].id, {active: true});
		    } else {
		        chrome.tabs.create({url: optionsUrl});
		    }
		});
	},

	/**
	 * Used on a first time install (and perhaps on an update) to set defaults
	 * for local storage. The default values are created by 'prefs.js' under the
	 * key prefix extensions.noojeeclick.
	 * 
	 * This method takes those defaults and puts them into the correct local
	 * storage.
	 * 
	 * We do this two phase method to be compatible with firefoxes 'pref' method
	 * for setting up defaults. The problem with the firefox method under chrome
	 * is that we have no way of controling when the
	 * defaults/preferencespreferences.js script runs so it runs every time the
	 * extension starts (by inclusion in background.html) rather than just on
	 * install or update. So initPrefs is only called on install or update to
	 * copy any defaults into localstorage. This stops localstorage being
	 * overwritten all of the time.
	 */
	initOptions: function ()
	{
		for (var i=0; i < localStorage.length; i++) 
		{
			var key = localStorage.key(i);
			var value = localStorage[key];
	
			var prefix = "z.defaults.noojeeclick.";
			var len = prefix.length;
			// Is this a default
			if (key.indexOf(prefix) == 0)
			{
				// yes so transfer it.
				key = key.substring(len);
				localStorage[key] = value;
				//console.log(key + " : " + value);
			}
		}
	},

	// Reset all of the options to the original installed defaults
	resetStorage : function () 
	{
		theApp.options.initOptions();
	},

	/**
	 * When options have changed we need to reset asterisk and the click icons
	 * as changes to the options can impact both of these.
	 */
	reset: function()
	{
		theApp.contentScriptMessageTo.refreshAll();
		
		// force a fresh login in case the asterisk settings changed.
		if (theApp.asterisk.getInstance() != null)
			theApp.asterisk.getInstance().setLoggedIn(false);
		
	},
	
	/**
	 * Saves options from the option.html page fields to localStorage.
	 */
	save_options: function() {
	
		// Phone
		localStorage['extension'] = $("#extension").val();
		localStorage['enableAutoAnswer'] = $("#auto-answer").attr('checked') == "checked";
		localStorage['handsetType'] = $("#phone-type").val();
		localStorage['internationalPrefix'] = $("#international-prefix").val();
		localStorage['dialPrefix'] = $("#dial-prefix").val();
		localStorage['localPrefix'] = $("#local-prefix-1").val();
		localStorage['localPrefixSubstitution'] = $("#local-prefix-2").val();
	
		// Patterns
		localStorage['pattern'] = $("#pattern").val();
	
		// Exclusions
		localStorage['exclusions'] = $("#exclusions").val();
	
		// Asterisk
		localStorage['host'] = $("#host").val();
		localStorage['port'] = $("#port").val();
		localStorage['username'] = $("#username").val();
		localStorage['password'] = $("#password").val();
		localStorage['context'] = $("#context").val();
		localStorage['useHttps'] = $("#use-https").attr('checked') == "checked";
	
		// Advanced
		localStorage['httpPrefix'] = $("#http-prefix").val();
		localStorage['callerId'] = $("#caller-id").val();
		localStorage['delimiters'] = $("#delimiters").val();
		localStorage['enableLogging'] = $("#enable-logging").attr('checked') == "checked";
		localStorage['enableDebugging'] = $("#enable-debugging").attr('checked') == "checked";
		localStorage['debugFilter'] = $("#debug-filters").val();
	},
	
	/**
	 * Loads the the options.html fields from localStorage.
	 */
	load_options: function() {
		// Phone
		$("#extension").val(localStorage['extension']);
		$("#auto-answer").attr('checked', localStorage['enableAutoAnswer'] == "true");
		$("#phone-type").val(localStorage['handsetType']);
		$("#international-prefix").val(localStorage['internationalPrefix']);
		$("#dial-prefix").val(localStorage['dialPrefix']);
		$("#local-prefix-1").val(localStorage['localPrefix']);
		$("#local-prefix-2").val(localStorage['localPrefixSubstitution']);
	
		// Patterns
		$("#pattern").val(localStorage['pattern']);
	
		// Exclusions
		$("#exclusions").val(localStorage['exclusions']);
	
		// Asterisk
		$("#host").val(localStorage['host']);
		$("#port").val(localStorage['port']);
		$("#username").val(localStorage['username']);
		$("#password").val(localStorage['password']);
		$("#context").val(localStorage['context']);
		$("#use-https").attr('checked', localStorage['useHttps'] == "true");
	
		// Advanced
		$("#http-prefix").val(localStorage['httpPrefix']);
		$("#caller-id").val(localStorage['callerId']);
		$("#delimiters").val(localStorage['delimiters']);
		$("#enable-logging").attr('checked', localStorage['enableLogging'] == "true");
		$("#enable-debugging").attr('checked', localStorage['enableDebugging'] == "true");
		$("#debug-filters").val(localStorage['debugFilter']);
		
	},
	
	/**
	 * Import data
	 */
	importOptions: function() {
		var importData = $( "#importoptions" ).val();
		var options = importData.split("\n");
		// read options line by line
		for(var i=0; i < options.length; i++) {
			var option = options[i];
			// split key from values
			var keyval = option.split("=");
			if(keyval.length == 2) {
				var key = keyval[0];
				var value = keyval[1];
				// replace ~ by \n
				value = value.replace(/~/g, "\n");
				// make sure that key is a valid setting
				if(localStorage[key] != null) {
					localStorage[key] = value;
				}
			}
		}
	},
	
	/**
	 * Generate export data
	 */
	getExport: function() {
		var data = "";
		for (var key in localStorage) {
			var prefix = "z.defaults";
			// we don't export defaults
			if (key.indexOf(prefix) == 0)
				continue;
			if(key != "password") {
				var val = localStorage[key];
				data += key + "=" + val.replace(/\n/g, "~") + "\n";
			}
		}
		return data;
	},
	
	
	
	initPage: function() {
			
			theApp.options.load_options();
			$( "#tabs" ).tabs();
			$( "button", ".actions" ).button();
			
			// callback function to bring a hidden box back
			function callback() {
				setTimeout(function() {
					$( "#status:visible" ).removeAttr( "style" ).fadeOut();
				}, 1000 );
			};
	
			// action on "Save Options"
			$( "#status" ).hide();
			$( "#save" ).click(function() {
				var options = {};
				$( "#status" ).show( "pulsate", options, 500, callback );
				theApp.options.save_options();
				theApp.options.reset();
				return false;
			});
	
			// action on "Reset Defaults"
			$( "#dialog-reset" ).hide();
			$( "#reset" ).click(function() {
				$( "#dialog-reset" ).dialog({
					resizable: false,
					height:220,
					width: 500,
					// modal: true,
					buttons: {
						"Reset values": function() {
							theApp.options.resetStorage();
							$( this ).dialog( "close" );
							// force reload
							window.location.reload();
							theApp.options.reset();
						},
						Cancel: function() {
							$( this ).dialog( "close" );
						}
					}
				});
			});
	
			// action on "Import"
			$( "#dialog-import" ).hide();
			$( "#import" ).click(function() {
				$( "#exportoptions" ).select();
				$( "#dialog-import" ).dialog({
					resizable: false,
					height:380,
					width: 700,
					// modal: true,
					buttons: {
						"Import": function() {
							theApp.options.importOptions();
							theApp.options.load_options();
							theApp.options.reset();
							$( this ).dialog( "close" );
						},
						Cancel: function() {
							$( this ).dialog( "close" );
						}
					}
				});
			});
	
			// action on "Export"
			$( "#dialog-export" ).hide();
			$( "#export" ).click(function() {
				$( "#exportoptions" ).val( theApp.options.getExport() );
				$( "#dialog-export" ).dialog({
					resizable: false,
					height:420,
					width: 700,
					// modal: true,
					buttons: {
						Done: function() {
							$( this ).dialog( "close" );
						}
					}
				});
			});
		}
	}

}});


$(document).ready(function () {noojeeClick.LIB.theApp.options.initPage();});