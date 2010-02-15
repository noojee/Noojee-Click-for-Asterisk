Components.utils.import("resource://noojeeclick/asterisk.jsm");

function onConfigurationClosed()
{
	onRefresh();
	// force a fresh login in case the asterisk settings changed.
	if (gAsterisk != null)
	{
		njdebug("configuration", "Forcing a fresh login incase any auth details have changed.");
		gAsterisk.setLoggedIn(false);
	}

    return false;
}

function onConfiguration(e)
{
	njdebug("configuration", "Configuration dialog has changed.");
	var features = "chrome,titlebar,toolbar,centerscreen,modal";
	window.openDialog("chrome://noojeeclick/content/xul/configuration.xul", "Preferences", features);

	return true;
}

