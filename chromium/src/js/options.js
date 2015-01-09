// Reset all of the options to the original installed defautls.
function resetStorage() 
{
	noojeeClick.LIB.theApp.prefs.initPrefs();
}

// Saves options from the option.html page fields
// to localStorage.
function save_options() {

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
}

// Loads the the options.html fields from localStorage.
function load_options() {
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
function importOptions() {
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
}

// Generate export data
function getExport() {
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
}

$(function() {
		$( "#tabs" ).tabs();
		$( "button", ".actions" ).button();
		
		//callback function to bring a hidden box back
		function callback() {
			setTimeout(function() {
				$( "#status:visible" ).removeAttr( "style" ).fadeOut();
			}, 1000 );
		};

		// action on "save"
		$( "#status" ).hide();
		$( "#save" ).click(function() {
			var options = {};
			$( "#status" ).show( "pulsate", options, 500, callback );
			save_options();
			return false;
		});

		// action on "reset"
		$( "#dialog-reset" ).hide();
		$( "#reset" ).click(function() {
			$( "#dialog-reset" ).dialog({
				resizable: false,
				height:220,
				width: 500,
				modal: true,
				buttons: {
					"Reset values": function() {
						resetStorage();
						$( this ).dialog( "close" );
						// force reload
						window.location.reload();
					},
					Cancel: function() {
						$( this ).dialog( "close" );
					}
				}
			});
		});

		// action on "import"
		$( "#dialog-import" ).hide();
		$( "#import" ).click(function() {
			$( "#exportoptions" ).select();
			$( "#dialog-import" ).dialog({
				resizable: false,
				height:380,
				width: 700,
				modal: true,
				buttons: {
					"Import": function() {
						importOptions();
						load_options();
						$( this ).dialog( "close" );
					},
					Cancel: function() {
						$( this ).dialog( "close" );
					}
				}
			});
		});

		// action on "export"
		$( "#dialog-export" ).hide();
		$( "#export" ).click(function() {
			$( "#exportoptions" ).val( getExport() );
			$( "#dialog-export" ).dialog({
				resizable: false,
				height:420,
				width: 700,
				modal: true,
				buttons: {
					Done: function() {
						$( this ).dialog( "close" );
					}
				}
			});
		});
	});



$(document).ready(function () {load_options();});