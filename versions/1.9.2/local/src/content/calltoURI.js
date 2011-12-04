noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.calltoURI =
{

// constants
SCHEME 					: "callto",
PROTOCOL_NAME 			: "'Noojee Click",
PROTOCOL_CONTRACTID 	: "@mozilla.org/network/protocol;1?name=" + SCHEME,

// Define the globally unique uuid for our uri.	
PROTOCOL_CID 			: Components.ID("1DF15BE2-8B32-11DF-BF53-757ADFD72085"),



// register our uri with firefox.
registerSelf: function (manager, fileSpec, location, type) 
{
	manager = manager.QueryInterface(Components.interfaces.nsIComponentRegistrar);

	manager.registerFactoryLocation(PROTOCOL_CID,
		PROTOCOL_NAME,
		PROTOCOL_CONTRACTID,
		fileSpec, 
		location, 
		type);
},

getClassObject: function (manager, cid, iid) 
{
	if (!cid.equals(PROTOCOL_CID)) 
		throw Components.resuls.NS_ERROR_NO_INTERFACE;
	if (!iid.equals(Components.interfaces.nsIFactory))
		throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
	return theApp.protocol;
},

canUnload: function (manager) 
{
	return true;
},



// XPCOM will automatically call this method when our module gets loaded.
NSGetModule: function () 
{
	return this;
}

// namespace termination
};
}
}
);