/* 
 * The defaults settings can be used to do basic provisioning.
 *  Change the host to match the asterisk host.
 *  Set the username and password to match an Asterisk Management Interface (AMI)
 *  user on your server (manager.conf).
 *  Leave the port setting unless you have change the default asterisk
 *  configuration.
 *  
 *  The first time Noojee click runs the username/password will be cleared from the default settings
 *  and moved into the Browsers Login Manager.
*/
pref("extensions.noojeeclick.host", "noojee.pmdomain.local");
pref("extensions.noojeeclick.port", "8088");
pref("extensions.noojeeclick.username", "click");
pref("extensions.noojeeclick.password", "Vei6Re0R");

/* setting firstrun to 'true' causes the above password to be moved into secure
 * storage the first time Noojee Click runs. The password is then removed from the
 * preferences.
 * In future version firstrun may be used to initialise other settings as well.
 */
pref("extensions.noojeeclick.firstrun", true);


/* Change the context to match the clients specific dialplan context 
When NJ Click originates a call it will do it in this context.
*/
pref("extensions.noojeeclick.context", "default");

/* Controls if the asterisk tab will be enabled/disabled.
Disable the asterisk tab if you don't want user to be able to
fiddle with the Asterisk settings. If you do this you need to 
set the default Asterisk host, port and context via this file
before shipping the xpi.
 */
pref("extensions.noojeeclick.tab.asterisk.enabled", false);
pref("extensions.noojeeclick.tab.advanced.enabled", false);

/* The follow control regional specific settings.
Australia:
	 internationalPrefix=0011
	 localPrefix=+61
	 localPrefixSubstitution=0
*/
pref("extensions.noojeeclick.internationalPrefix", "");
pref("extensions.noojeeclick.localPrefix", "");
pref("extensions.noojeeclick.localPrefixSubstitution", "");

/*
The following controls what phone numbers are recognized by default.
Change the patterns to handle your local region
*/
pref("extensions.noojeeclick.pattern", "XXXX XXX XXX\nXXXX XXXX\nXX XXXX XXXX\nXXXXXXXXXX\nXX XXXXXXXX\nXXX-XXX-XXXX\n(XX) XXXX XXXX\n+XX X XXXX XXXX\nXXX-XXX-XXXX\n(XXX) XXX-XXX\n+XXXXXXXXXXX\n+X.XXX.XXX.XXXX\n(XXX) XXX-XXXX\nXXX XXXX\n");

pref("extensions.noojeeclick.showClickIcons", true);
pref("extensions.noojeeclick.initialised", false);
pref("extensions.noojeeclick.serverType", "AJAM");
pref("extensions.noojeeclick.extension", "");
pref("extensions.noojeeclick.enableAutoAnswer", true);
pref("extensions.noojeeclick.handsetType", "Yealink");
pref("extensions.noojeeclick.dialPrefix", "");
pref("extensions.noojeeclick.enableLogging", false);
pref("extensions.noojeeclick.enableDebugging", false);
pref("extensions.noojeeclick.debugFilter", "config, api, asterisk, event.low, event.high, job, noojeeclick, phonepatterns, prefs, render, sequence, util, monitor, excluded, remove");
pref("extensions.noojeeclick.httpPrefix", "asterisk");
pref("extensions.noojeeclick.useHttps", false);
pref("extensions.noojeeclick.callerId", "");
pref("extensions.noojeeclick.delimiters", "()-/.");
pref("extensions.noojeeclick.monitor", true);
pref("extensions.noojeeclick.exclusions", "http://www.noojee.com.au");
pref("extensions.noojeeclick.lastDialed", "");

pref("extensions.noojeeclick.clidquickpick.enabled", true);
pref("extensions.noojeeclick.clidquickpick.url", "http://noojee.pmdomain.local/servicemanager/NoojeeClickCallerId");

pref("extensions.noojeeclick.suppressNoojeeAnswerBar.enabled", false);

/* debug options */
/*
pref("browser.dom.window.dump.enabled", true);
pref("javascript.options.showInConsole", true);
pref("javascript.options.strict", true);
pref("nglayout.debug.disable_xul_cache", true);
pref("nglayout.debug.disable_xul_fastload", true);
*/
