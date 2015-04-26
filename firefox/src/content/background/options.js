
noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.options =
{

showOptions: function (e)
{
	var features = "chrome,titlebar,toolbar,centerscreen,modal";
	window.openDialog("chrome://noojeeclick/content/xul/options.xul", "Preferences", features);

	theApp.render.onRefresh();
	// force a fresh login in case the asterisk settings changed.
	if (theApp.asterisk.getInstance() != null)
		theApp.asterisk.getInstance().setLoggedIn(false);
	return true;
},

onTestConnection: function ()
{
	var features = "chrome,titlebar,toolbar,centerscreen,modal";

	window.openDialog("chrome://noojeeclick/content/xul/diagnose.xul", "Diagnose", features);
},

};

}});