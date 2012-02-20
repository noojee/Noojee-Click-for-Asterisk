/* 
 * The defaults settings can be used to do basic provisioning.
 *  Change the host to match the asterisk host.
 *  Set the username and password to match an Asterisk Management Interface (AMI)
 *  user on your server (manager.conf).
 *  Leave the port setting unless you have change the default asterisk
 *  configuration.
*/
pref("firstrun", true);

pref("host", "");
pref("port", "8088");
pref("username", "");
pref("password", "");

/* Change the context to match the clients specific dialplan context 
When NJ Click originates a call it will do it in this context.
*/
pref("context", "default");

/* Controls if the asterisk tab will be enabled/disabled.
Disable the asterisk tab if you don't want user to be able to
fiddle with the Asterisk settings. If you do this you need to 
set the default Asterisk host, port and context via this file
before shipping the xpi.
 */
pref("tab.asterisk.enabled", true);

/* The follow control regional specific settings.
Australia:
	 internationalPrefix=0011
	 localPrefix=+61
	 localPrefixSubstitution=0
*/
pref("internationalPrefix", "");
pref("localPrefix", "");
pref("localPrefixSubstitution", "");

/*
The following controls what phone numbers are recognized by default.
Change the patterns to handle your local region
*/
pref("pattern", "XXXX XXX XXX\nXXXX XXXX\nXX XXXX XXXX\nXXXXXXXXXX\nXX XXXXXXXX\nXXX-XXX-XXXX\n(XX) XXXX XXXX\n+XX X XXXX XXXX\nXXX-XXX-XXXX\n(XXX) XXX-XXX\n+XXXXXXXXXXX\n+X.XXX.XXX.XXXX\n(XXX) XXX-XXXX\nXXX XXXX\n");

pref("showClickIcons", true);
pref("initialised", false);
pref("serverType", "AJAM");
pref("extension", "");
pref("enableAutoAnswer", false);
pref("handsetType", "Yealink");
pref("dialPrefix", "");
pref("enableLogging", false);
pref("enableDebugging", false);
pref("debugFilter", "config, api, asterisk, events.high, job, noojeeclick, phonepatterns, prefs, render, sequence, util, monitor, excluded, remove");
pref("httpPrefix", "asterisk");
pref("useHttps", false);
pref("callerId", "");
pref("delimiters", "()-/.");
pref("monitor", true);
pref("exclusions", "http://www.noojee.com.au");
pref("lastDialed", "");

/* debug options */
/*
pref("browser.dom.window.dump.enabled", true);
pref("javascript.options.showInConsole", true);
pref("javascript.options.strict", true);
pref("nglayout.debug.disable_xul_cache", true);
pref("nglayout.debug.disable_xul_fastload", true);
*/
