/**
 * Copyright 2012 Brett Sutton
 * (Adapted for Google Chrome by Sven Werlen)
 *
 * This file is part of Noojee Click.
 * 
 * Noojee Click is free software: you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the 
 * Free Software Foundation, either version 3 of the License, or (at your 
 * option) any later version.
 * 
 * Noojee Click is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License 
 * for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with Noojee Click. If not, see http://www.gnu.org/licenses/.
 **/

var noojeeClick = {};

(function()
{
	// for debugging as we can't use njdebug during the initialisation.
	// var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
	// .getService(Components.interfaces.nsIConsoleService);

	var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1", Components.interfaces.nsILoginInfo, "init");
	var nsLoginManager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);

	var url = "chrome://noojeeclick";

	// Registration
	var namespaces = [];

	// As each module (.js) file loads
	// it registers itself as a namespace by calling noojeeClick.ns(...).
	this.ns = function(fn)
	{
		var aNamespace =
		{};
		namespaces.push(fn, aNamespace);
		
		return aNamespace;
	};

	function setValue(key, value)
	{
		var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		var Branch = prefObj.getBranch("extensions.noojeeclick.");

		if (typeof value == 'boolean')
			Branch.setBoolPref(key, value);
		else
			Branch.setCharPref(key, value);
	}
	;

	/*
	 * Used to support the above function onConfigurationLoad. This method is an
	 * intentional duplication of noojeeClick.util.getBoolValue
	 */
	function getBoolValue(key)
	{
		var value = null;
		try
		{
			var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
			var Branch = prefObj.getBranch("extensions.noojeeclick.");
			value = Branch.getBoolPref(key);
		} catch (e)
		{
			// ignored as just means that key doesn't exist.
		}

		return value;
	}
	;

	function getValue(key)
	{
		var value = null;
		try
		{
			var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
			var Branch = prefObj.getBranch("extensions.noojeeclick.");
			value = Branch.getCharPref(key);
		} catch (e)
		{
			// ignored as it probably means that this preference hasn't been
			// set.
		}
		return value;
	}
	;

	// duplicate of njdebug so we can still output debug messages during
	// initilisation.
	// We can't call the normal njdebug until the namespaces are all setup.
	function ns_debug(module, msg)
	{
		if (getBoolValue("enableDebugging") == true)
		{
			var filter = getValue("debugFilter");

			if (filter == null || filter.search(module, "i") >= 0)
			{
				var now = new Date();
				var hour = now.getHours();
				var min = now.getMinutes();
				var sec = now.getSeconds();
				var mil = now.getMilliseconds();
				// for debugging as we can't use njdebug during the
				// initialisation.
				var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

					consoleService.logStringMessage(hour + ":" + min + ":" + sec + ":" + mil + " debug (" + module + "): " + msg);
			}
		}
	}
	;

	function ns_alert(msg)
	{
		try
		{
			var iPrompt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
			iPrompt.alert(window, "Noojee Click", msg);
		} catch (e)
		{
			var now = new Date();
			var hour = now.getHours();
			var min = now.getMinutes();
			var sec = now.getSeconds();
			var mil = now.getMilliseconds();
			// for debugging as we can't use njdebug during the
			// initialisation.
			var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

			consoleService.logStringMessage(hour + ":" + min + ":" + sec + ":" + mil + " alert: " + msg);
		}
	}
	;

	/*
	 * set a boolean noojee click preference.
	 */
	function setBoolValue(key, value)
	{
		var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		var Branch = prefObj.getBranch("extensions.noojeeclick.");

		Branch.setBoolPref(key, value);
	}
	;

	this.onPageLoad = function(event)
	{
		noojeeClick.noojeeclick.onPageLoad(event);
	};

	this.onRefresh = function()
	{
		noojeeClick.render.onRefresh();
	};

	this.showMenuHideItems = function()
	{
		noojeeClick.noojeeclick.showMenuHideItems();
	};

	function PrefListener(branchName, func)
	{
		var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		var branch = prefService.getBranch(branchName);
		branch.QueryInterface(Components.interfaces.nsIPrefBranch2);

		this.register = function()
		{
			branch.addObserver("", this, false);
			branch.getChildList("",
			{}).forEach(function(name)
			{
				func(branch, name);
			});
		};

		this.unregister = function unregister()
		{
			if (branch)
				branch.removeObserver("", this);
		};

		this.observe = function(subject, topic, data)
		{
			if (topic == "nsPref:changed")
				func(branch, data);
		};
	}
	;
	
	this.reloadQuickPicks = function()
	{
		setBoolValue("clidquickpick.reload", true);
	}
	
	this.retrieveQuickPicks = function()
	{
		if (getBoolValue("clidquickpick.reload"))
		{
			setBoolValue("clidquickpick.reload", false);
			var quickPickUrl = getValue("clidquickpick.url");
	
			ns_debug("quickpicks", "retrieving CLID quickpicks: url=" + quickPickUrl);
			var xmlhttp;
			xmlhttp = new XMLHttpRequest();
	
			// setup the call back handler
			xmlhttp.onreadystatechange = function()
			{
				try
				{
					ns_debug("quickpicks", "readstate changed state=" + xmlhttp.readyState);
	
					if (xmlhttp.readyState == 4)
					{
						if (xmlhttp.status == 200)
						{
							// We have a success so lets load the pick list and save
							// it to properties.
	
							var xmlResponse = xmlhttp.responseXML;
							ns_debug("quickpicks", "quickpicks recieved: data=" + xmlResponse);
	
							var quickPicks = xmlResponse.getElementsByTagName('clid-quick-pick');
	
							var count = quickPicks.length;
							ns_debug("quickpicks", "quickpicks count: " + count);
							setValue("clidquickpick.count", count);
	
							for ( var i = 0; i < count; i++)
							{
								var name = quickPicks[i].getAttribute("name");
								var clid = quickPicks[i].getAttribute("clid");
	
								ns_debug("quickpicks", "received quickpick: " + name + ", " + clid);
								setValue("clidquickpick.pick-" + i + "-name", name);
								setValue("clidquickpick.pick-" + i + "-clid", clid);
							}
						}
						else
						{
							ns_debug("quickpicks", "An error occured attempting to retrieve the CLID Quick Pick list. " + xmlhttp.responseXML);
						}
	
						ns_debug("quickpicks", "exiting state=" + xmlhttp.readyState);
						// Flag that the menu needs to be reloaded.
						setBoolValue("clidquickpick.reset", "true");
					}
				} catch (e)
				{
					ns_debug("quickpicks", "exception " + e);
				}
			};
	
			ns_debug("quickpicks", "calling open on url");
			xmlhttp.open("GET", quickPickUrl, true);
	
			// xmlhttp.open("GET", quickPickUrl + ((/\?/).test(url) ? "&" : "?") +
			// (new Date()).getTime(), true);
			// xmlhttp.withCredentials = "true";
			ns_debug("quickpicks", "calling send on url");
			xmlhttp.send();
			ns_debug("quickpicks", "calling send complete");
		}
	};


	// Initialization
	this.initialize = function()
	{
		try
		{
			for ( var i = 0; i < namespaces.length; i += 2)
			{
				var fn = namespaces[i];

				var ns = namespaces[i + 1];
				fn.apply(ns);
			}

			// Noojee Click specific initialisation

			// Add a listener to for preference changes so we can refresh the
			// click icons
			// if a pattern match changes.
			var myListener = new PrefListener("extensions.noojeeclick.", function(branch, name)
			{
				try
				{
					switch (name)
					{
					case "pattern":
						// noojeeClick.onRefresh();
						break;
					}
				} catch (e)
				{
					ns_alert("Error occured calling onRefresh during a preference change to a 'pattern'");
				}
			});
			myListener.register();

			// On first run check the preferences for a password
			// and move it into the store.
			// This works for both existing installs and custom
			// builds where we ship the password in the defaults.
			if (getBoolValue("firstrun") == true || getBoolValue("firstrun") == null)
			{
				var password = getValue("password");
				var username = getValue("username");
				var host = getValue("host");

				if (host != null && username != null && password != null && password.length > 0)
				{
					storeCredentials(host, username, password);
					// clear the password out of the defaults.
					setValue("password", "");
				}

				setBoolValue("firstrun", false);
			}

			// Hook the page load event
			if (window.document != null)
			{
				var appcontent = window.document.getElementById("appcontent");
				if (appcontent != undefined && appcontent != null)
					appcontent.addEventListener("DOMContentLoaded", noojeeClick.onPageLoad, false);
			}

			// Add a context menu handler so we can dynamically show/hide
			// specific menu items.
			var contextMenu = document.getElementById("contentAreaContextMenu");
			if (contextMenu)
				contextMenu.addEventListener("popupshowing", noojeeClick.showMenuHideItems, false);
			
			
			// every 5 seconds check if quick picks need to be reloaded.
			// We orginally did this off the back of the configuration window close event
			// but when the window closes all timers are killed (as well as any outstanding ajax calls).
			// hence we now have this timer.
			setInterval(function () {noojeeClick.retrieveQuickPicks()}, 5000);

		} 
		catch (e)
		{
			ns_alert("Noojee Click error in initialize " + e);
		}
	};

	// Clean up
	this.shutdown = function()
	{
		window.removeEventListener("load", noojeeClick.initialize, false);
		window.removeEventListener("unload", noojeeClick.shutdown, false);
	};

	function getObjectClass(obj)
	{
		if (obj && obj.constructor && obj.constructor.toString)
		{
			var arr = obj.constructor.toString().match(/function\s*(\w+)/);

			if (arr && arr.length == 2)
			{
				return arr[1];
			}
		}

		return undefined;
	}
	;

	this.getUsername = function()
	{
		return getValue("username");
	};

	this.storeCredentials = function(hostname, username, password)
	{
		storeCredentials(hostname, username, password);
	};

	function storeCredentials(hostname, username, password)
	{

		if (hostname == null || hostname.length == 0 || username == null || username.length == 0 || password == null || password.length == 0)
		{
			ns_alert("Error: You can't save the Noojee Click configuration with an empty Host, Username or Password.");
		}
		else
		{

			var newLoginInfo = new nsLoginInfo(hostname, url, null, // 'Asterisk
			// Auth',
			username, password, "", "");
			var existingLoginInfo = findCredentials(hostname, username);
			if (existingLoginInfo != null)
				nsLoginManager.removeLogin(existingLoginInfo);

			nsLoginManager.addLogin(newLoginInfo);
		}
	}
	;

	/*
	 * * returns the login object for the given hostname/username combination if
	 * it exists. * If the credential doesn't exist then null is returned. * The
	 * hostname should the ip address/hostname of the asterisk server as * it
	 * appears in the configuration dialog.
	 */
	function findCredentials(hostname, username)
	{
		// Find users for the given parameters
		var logins = nsLoginManager.findLogins(
		{}, hostname, url, null);

		ns_debug("config", "retrieveCredentials login=" + logins);

		var login = null;

		// Find user from returned array of nsILoginInfo objects
		for ( var i = 0; i < logins.length; i++)
		{
			ns_debug("config", "login=" + logins[i].username);
			if (logins[i].username == username)
			{
				login = logins[i];
				break;
			}
		}
		return login;
	}
	;

	this.retrieveCredentials = function(hostname, username)
	{
		return retrieveCredentials(hostname, username);
	};

	/*
	 * * returns the password for the given hostname/username combination * The
	 * hostname should the ip address/hostname of the asterisk server as * it
	 * appears in the configuration dialog.
	 */
	function retrieveCredentials(hostname, username)
	{
		var password = null;
		var login = findCredentials(hostname, username);

		if (login != null)
			password = login.password;

		return password;
	}
	;

	/*
	 * This method doesn't really belong here, unfortunately this method is used
	 * from configuration.xul and configuration.xul doesn't like initialising
	 * the name space. I believe that a xul windows is just like another browser
	 * instance and so the namespace has to be loaded. My best guess is that the
	 * eventListeners (at the bottom of this class) aren't being called.
	 */
	this.onConfigurationLoad = function()
	{
		try
		{
			ns_debug("config", "onConfigurationLoad called");
			if (window.document != null)
			{
				var tabBox = window.document.getElementById('njConfigTabbox');
				var asteriskTab = tabBox.tabs.getItemAtIndex(3);
				var advancedTab = tabBox.tabs.getItemAtIndex(4);

				// Check if we need to disable the asterisk tab
				if (getBoolValue("tab.asterisk.enabled") == false)
				{
					ns_debug("config", "asterisk tab disabled");
					asteriskTab.disabled = true;
					asteriskTab.collapsed = true;
				}
				else
					ns_debug("config", "asterisk tab enabled");

				// Check if we need to disable the advanced tab
				if (getBoolValue("tab.advanced.enabled") == false)
				{
					ns_debug("config", "advanced tab disabled");
					advancedTab.disabled = true;
					advancedTab.collapsed = true;
				}
				else
					ns_debug("config", "advanced tab enabled");

				// retrieve the password
				var password = this.retrieveCredentials(getValue("host"), this.getUsername());
				var passwordField = window.document.getElementById('njcPassword');
				passwordField.value = password;
			}
		} catch (e)
		{
			ns_alert("error loading configuration " + e);
		}
	};

	

	this.onConfigurationClosed = function()
	{
		try
		{
			ns_debug("config", "onConfigurationClosed called");

			if (window.document != null)
			{
				var hostField = window.document.getElementById('host');
				var usernameField = window.document.getElementById('username');
				var passwordField = window.document.getElementById('njcPassword');
				this.storeCredentials(hostField.value, usernameField.value, passwordField.value);

				// If clid quick picks are enabled the refresh the list now.
				var quickPickEnabled = getBoolValue("clidquickpick.enabled");
				ns_debug("quickpicks", "clidquickpick.enabled:" + quickPickEnabled);
				if (quickPickEnabled == true)
				{
					this.reloadQuickPicks();
				}
			}
		} catch (e)
		{
			ns_alert("error saving configuration " + e);
			ns_debug("config", "Exception: " + e);
		}

		// noojeeClick.render.enableRefresh();

		return false;
	};

	// Register handlers to maintain extension life cycle.
	window.addEventListener("load", noojeeClick.initialize, false);
	window.addEventListener("unload", noojeeClick.shutdown, false);

}).apply(noojeeClick);
