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
			        theApp.util.debug("uri", "newUri.spec=" + spec);
			        return uri;
		        },

		        newChannel : function(uri)
		        {
			        var fullURI = uri.spec;

			        // Extract the phone number from the uri and dial it.
			        // URI is of the form callto://nnnnnnnn

			        var phoneNo = fullURI.substring(fullURI.indexof("//") + 2);
			        theApp.util.debug("uri", "newChannel=" + fullURI + " phoneNo=" + phoneNo);

			        var ios = Components.classes[kIOSERVICE_CONTRACTID].getService(nsIIOService);

			        return ios.newChannel("javascript:theApp.asterisk.getInstance().dial(phoneNo)", null, null);
		        },
		    }

		};
	};
});