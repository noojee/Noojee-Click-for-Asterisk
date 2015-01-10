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

noojeeClick.ns(function()
{
	with (noojeeClick.LIB)
	{

		theApp.protocol =
		{

		    SIMPLEURI_CONTRACTID : "@mozilla.org/network/simple-uri;1",
		    // IOSERVICE_CONTRACTID : "@mozilla.org/network/io-service;1",
		    // NS_IOSERVICE_CID : "{9ac9e770-18bc-11d3-9337-00104ba0fd40}",

		    nsISupports : Components.interfaces.nsISupports,
		    nsIIOService : Components.interfaces.nsIIOService,
		    nsIProtocolHandler : Components.interfaces.nsIProtocolHandler,
		    nsIURI : Components.interfaces.nsIURI,

		    createInstance : function(outer, iid)
		    {
			    if (outer != null) throw Components.results.NS_ERROR_NO_AGGREGATION;

			    if (!iid.equals(nsIProtocolHandler) && !iid.equals(nsISupports))
			        throw Components.results.NS_ERROR_NO_INTERFACE;

			    return new Protocol();
		    },

		    prototype :
		    {
		        QueryInterface : function(iid)
		        {
			        if (!iid.equals(nsIProtocolHandler) && !iid.equals(nsISupports))
			            throw Components.results.NS_ERROR_NO_INTERFACE;
			        return this;
		        },

		        scheme : SCHEME,
		        defaultPort : -1,
		        protocolFlags : nsIProtocolHandler.URI_NORELATIVE | nsIProtocolHandler.URI_NOAUTH,

		        allowPort : function(port, scheme)
		        {
			        return false;
		        },

		        newURI : function(spec, charset, baseURI)
		        {
			        var uri = Components.classes[SIMPLEURI_CONTRACTID].createInstance(nsIURI);
			        uri.spec = spec;
			        theApp.logging.njdebug("uri", "newUri.spec=" + spec);
			        return uri;
		        },

		        newChannel : function(uri)
		        {
			        var fullURI = uri.spec;

			        // Extract the phone number from the uri and dial it.
			        // URI is of the form callto://nnnnnnnn

			        var phoneNo = fullURI.substring(fullURI.indexof("//") + 2);
			        theApp.logging.njdebug("uri", "newChannel=" + fullURI + " phoneNo=" + phoneNo);

			        var ios = Components.classes[kIOSERVICE_CONTRACTID].getService(nsIIOService);

			        return ios.newChannel("javascript:theApp.asterisk.getInstance().dial(phoneNo)", null, null);
		        },
		    }

		};
	};
});