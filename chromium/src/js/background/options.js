// Singleton access to options

var options = (function(window, undefined)
{

	var instance = null;

	// revealing module pattern that handles initialization of our new module
	function initializeNewModule()
	{

		function init()
		{
			loadDefaults();
		}

		function getValue(key)
		{
			return localStorage[key];
		}

		function getBoolValue(key)
		{
			return getValue(key) == "true";
		}

		function setValue(key, value)
		{
			localStorage[key] = value;
		}

		function setBoolValue(key, value)
		{
			localStorage[key] = (value == "true" ? true : false);
		}

		function getUsername()
		{
			return getValue("username");
		}

		function getPassword(username)
		{
			return getValue("password");
		}

		// Removes all options from storage
		function clearStorage()
		{
			for ( var key in localStorage)
			{
				localStorage.removeItem(key);
			}
		}

		// Saves options to localStorage.
		function saveOptions()
		{
			debugger;
			clearStorage();

			// Phone
			localStorage['extension'] = trim($("#extension").val());
			localStorage['enableAutoAnswer'] = $("#auto-answer").attr('checked') == "checked";
			localStorage['handsetType'] = $("#phone-type").val();
			localStorage['internationalPrefix'] = trim($("#international-prefix").val());
			localStorage['dialPrefix'] = trim($("#dial-prefix").val());
			localStorage['localPrefix'] = trim($("#local-prefix-1").val());
			localStorage['localPrefixSubstitution'] = trim($("#local-prefix-2").val());

			// Patterns
			localStorage['pattern'] = trim($("#pattern").val());

			// Exclusions
			localStorage['exclusions'] = trim($("#exclusions").val());

			// Asterisk
			localStorage['host'] = trim($("#host").val());
			localStorage['port'] = trim($("#port").val());
			localStorage['username'] = trim($("#username").val());
			localStorage['password'] = $("#password").val();
			localStorage['context'] = trim($("#context").val());
			localStorage['useHttps'] = $("#use-https").attr('checked') == "checked";

			// Advanced
			localStorage['httpPrefix'] = trim($("#http-prefix").val());
			localStorage['callerId'] = trim($("#caller-id").val());
			localStorage['delimiters'] = trim($("#delimiters").val());
			localStorage['enableLogging'] = $("#enable-logging").attr('checked') == "checked";
			localStorage['enableDebugging'] = $("#enable-debugging").attr('checked') == "checked";
			localStorage['debugFilter'] = trim($("#debug-filters").val());
		}

		// Restores select box state to saved value from localStorage.
		function restoreOptions()
		{
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

		}

		// Import data
		function importOptions()
		{
			var importData = $("#importoptions").val();
			var options = importData.split("\n");
			// read options line by line
			for (var i = 0; i < options.length; i++)
			{
				var option = options[i];
				// split key from values
				var keyval = option.split("=");
				if (keyval.length == 2)
				{
					var key = keyval[0];
					var value = keyval[1];
					// replace ~ by \n
					value = value.replace(/~/g, "\n");
					// make sure that key is a valid setting
					if (localStorage[key] !== null)
					{
						localStorage[key] = trim(value);
					}
				}
			}
		}

		// Generate export data
		function getExport()
		{
			var data = "";
			for ( var key in localStorage)
			{
				if (key != "password")
				{
					var val = localStorage[key];
					data += key + "=" + val.replace(/\n/g, "~") + "\n";
				}
			}
			return data;
		}

		/**
		 * Set of defaults used when noojee click is first installed.
		 */
		function loadDefaults()
		{
			if (getBoolValue("firstrun") != true)
				return; // already run so do nothing.

			function defaultOption(key, value)
			{
				// // For compatibility with the Firefox version we strip the key prefix.
				// if (key.indexOf("extensions.noojeeclick.") === 0)
				// key = key.substring(23);

				// check that value is not already set
				if (!localStorage[key])
				{
					localStorage[key] = value;
				}
			}

			/**
			 * Used to know if we have initialised the preferences since install
			 */
			defaultOption("firstrun", true);

			defaultOption("host", "noojee.pmdomain.local");
			defaultOption("port", "8088");
			defaultOption("username", "click");
			defaultOption("password", "");

			/*
			 * Change the context to match the clients specific dialplan context When NJ Click originates a call it will do it in this context.
			 */
			defaultOption("context", "default");

			/*
			 * Controls if the asterisk tab will be enabled/disabled. Disable the asterisk tab if you don't want user to be able to fiddle with the Asterisk
			 * settings. If you do this you need to set the default Asterisk host, port and context via this file before shipping the xpi.
			 */
			defaultOption("tab.asterisk.enabled", true);
			defaultOption("tab.advanced.enabled", true);

			/*
			 * The follow control regional specific settings. Australia: internationalPrefix=0011 localPrefix=+61 localPrefixSubstitution=0
			 */
			defaultOption("internationalPrefix", "");
			defaultOption("localPrefix", "");
			defaultOption("localPrefixSubstitution", "");

			/*
			 * The following controls what phone numbers are recognized by default. Change the patterns to handle your local region
			 */
			defaultOption(
					"pattern",
					"XXXX XXX XXX\nXXXX XXXX\nXX XXXX XXXX\nXXXXXXXXXX\nXX XXXXXXXX\nXXX-XXX-XXXX\n(XX) XXXX XXXX\n+XX X XXXX XXXX\nXXX-XXX-XXXX\n(XXX) XXX-XXX\n+XXXXXXXXXXX\n+X.XXX.XXX.XXXX\n(XXX) XXX-XXXX\nXXX XXXX\n");

			defaultOption("showClickIcons", true);
			defaultOption("initialised", false);
			defaultOption("extension", "");
			defaultOption("enableAutoAnswer", true);
			defaultOption("handsetType", "Yealink");
			defaultOption("dialPrefix", "");
			defaultOption("enableLogging", false);
			defaultOption("enableDebugging", false);
			defaultOption("debugFilter",
					"config, api, asterisk, event.low, event.high, job, noojeeclick, phonepatterns, prefs, render, sequence, util, monitor, excluded, remove");
			defaultOption("httpPrefix", "asterisk");
			defaultOption("useHttps", false);
			defaultOption("callerId", "");
			defaultOption("delimiters", "()-/.");
			defaultOption("monitor", true);
			defaultOption("exclusions", "http://www.noojee.com.au");
			defaultOption("lastDialed", "");

			defaultOption("clidquickpick.enabled", true);
			defaultOption("clidquickpick.url", "http://noojee.pmdomain.local/servicemanager/NoojeeClickCallerId");

			defaultOption("suppressNoojeeAnswerBar.enabled", false);

			/* debug options */
			/*
			 * defaultOption("browser.dom.window.dump.enabled", true); defaultOption("javascript.options.showInConsole", true);
			 * defaultOption("javascript.options.strict", true); defaultOption("nglayout.debug.disable_xul_cache", true);
			 * defaultOption("nglayout.debug.disable_xul_fastload", true);
			 */
		}

		// UI handlers for the Options window.
		$(function()
		{
			$("#tabs").tabs();
			$("button", ".actions").button();

			// callback function to bring a hidden box back
			function callback()
			{
				setTimeout(function()
				{
					$("#status:visible").removeAttr("style").fadeOut();
				}, 1000);
			}

			// action on "save"
			$("#status").hide();
			$("#save").click(function()
			{
				var options =
				{};
				$("#status").show("pulsate", options, 500, callback);
				saveOptions();
				return false;
			});

			// action on "reset"
			$("#dialog-reset").hide();
			$("#reset").click(function()
			{
				$("#dialog-reset").dialog(
				{
					resizable : false,
					height : 220,
					width : 500,
					modal : true,
					buttons :
					{
						"Reset values" : function()
						{
							clearStorage();
							$(this).dialog("close");
							// force reload
							window.location.reload();
						},
						Cancel : function()
						{
							$(this).dialog("close");
						}
					}
				});
			});

			// action on "import"
			$("#dialog-import").hide();
			$("#import").click(function()
			{
				$("#exportoptions").select();
				$("#dialog-import").dialog(
				{
					resizable : false,
					height : 380,
					width : 700,
					modal : true,
					buttons :
					{
						"Import" : function()
						{
							importOptions();
							restoreOptions();
							$(this).dialog("close");
						},
						Cancel : function()
						{
							$(this).dialog("close");
						}
					}
				});
			});

			// action on "export"
			$("#dialog-export").hide();
			$("#export").click(function()
			{
				$("#exportoptions").val(getExport());
				$("#dialog-export").dialog(
				{
					resizable : false,
					height : 420,
					width : 700,
					modal : true,
					buttons :
					{
						Done : function()
						{
							$(this).dialog("close");
						}
					}
				});
			});
		});

		return {
			init : init,
			getValue : getValue,
			setValue : setValue,
			getBoolValue : getBoolValue,
			setBoolValue : setBoolValue,
			getUsername : getUsername,
			getPassword : getPassword,
			loadDefaults : loadDefaults,
			clearStorage : clearStorage,
			saveOptions : saveOptions,
			restoreOptions : restoreOptions,
			importOptions : importOptions,
			getExport : getExport
		};

	}

	// handles the prevention of additional instantiations
	function getInstance()
	{
		if (!instance)
		{
			instance = new initializeNewModule();
			instance.init();
		}
		return instance;
	}

	return {
		getInstance : getInstance
	};

})(window);

options.getInstance().restoreOptions();


//$(document).ready(function()
//{
//	this.options.getInstance().restoreOptions();
//});



