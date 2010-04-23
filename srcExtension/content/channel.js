/**
 * Provides a way of transfering arbitrary JSON objects between a HTML-page and
 * the extension; this script is to be inserted in extension code
 *
 * For Client (HTML) - Javascript, see <code>dataclient.js</code>
 *
 * @author Phil
 * @date 2007/08/23
 * @see http://forums.mozillazine.org/viewtopic.php?t=171216
 * @see http://www.json.org/js.html for JSON support
 */
var DataTransferListener = {
	ELWMS_EVENT_NAME: "ELWMSDataTransferEvent",
	ELWMS_EVENT_BACK_NAME: "ELWMSDataBackchannelEvent",
	/**
	 * Listener that subscribes to custom ELWMS Event
	 *
	 * @param {Event} aEvent the event thrown by the HTML Element
	 */
	listenToHTML: function(aEvent) {
		// first we have to check if we allow this... based on URL or what?
		if (aEvent.target.ownerDocument.location.host != "localhost") {
			// TODO: add security here (e.g. from Pref/Setting of applet serving host)!
			// njAlert("As for security issues only secure HTML pages may pass data to ELWMS extension.");
			// return;
		}
		// data is a escaped JSON String
		var data = unescape(aEvent.target.getAttribute("data")).parseJSON();
		// what to do with the received data?
		var retval = DataTransferListener.handleData(data, aEvent.target);
		// if back data is given:
		if (retval != null) {
			// add escaped and JSONified Object to <code>returnvalue</code>-Attribute
			aEvent.target.setAttribute("returnvalue", escape(retval.toJSONString()));
			// fire event to notify HTML-Page of return value
			var ev = window.document.createEvent("Event");
			ev.initEvent(DataTransferListener.ELWMS_EVENT_BACK_NAME, true, false);
			aEvent.target.dispatchEvent(ev);
		}
	},
	/**
	 * this function should handle all arriving data
	 *
	 * @param {Object} data The JSON Object
	 * @param {HTMLNode} target The node that fired the event
	 */
	handleData : function(data, target) {
		njAlert("DataTransferListener.handleData: obtained " + data.name);
		if (data.id &gt; 1000) {
			njAlert("DataTransferListener.handleData: returning changed data")
			return {id:2000, name:"Pong"};
		}
		return null;
	}
}
 
/**
 * Acc. to web page (see above) the 4th parameter denotes if Events are accepted from
 * unsecure sources.
 */
document.addEventListener(DataTransferListener.ELWMS_EVENT_NAME, DataTransferListener.listenToHTML, false, true);



---------------------------------------


/**
 * Provides a way of transfering arbitrary JSON objects from a HTML-page to a
 * extension
 *
 * For Extension (XUL) - Javascript, see <code>datatransfer.js</code>
 *
 * @author Phil
 * @date 2007/08/23
 * @see http://forums.mozillazine.org/viewtopic.php?t=171216
 * @see http://www.json.org/js.html for JSON support
 */
var Communicator = {
	ELWMS_EVENT_NAME: "ELWMSDataTransferEvent",
	ELWMS_EVENT_BACK_NAME: "ELWMSDataBackchannelEvent",
	ELWMS_CALLER_ID : "elwmsdataelement",
	ELWMS_ELEMENT_NAME : "ELWMSDataElement",
 
	/**
	 * initializes the Element and Listeners
	 *
	 */
	init : function() {
		// create data / event firing Elements
		var element = Communicator.createElement();
		// register custom event on callback
		element.addEventListener(Communicator.ELWMS_EVENT_BACK_NAME, Communicator.calledBack, true);
	},
 
	/**
	 * creates the data element
	 *
	 * @return {HTMLElement} the created Element of the type <code>Communicator.ELWMS_ELEMENT_NAME</code>
	 */
	createElement : function() {
		// may I create an Event?
		if ("createEvent" in document) {
		  	// if element is not yet existing
	  		if (!document.getElementById(Communicator.ELWMS_CALLER_ID)) {
		  		var element = document.createElement(Communicator.ELWMS_ELEMENT_NAME);
		  		element.setAttribute("id", Communicator.ELWMS_CALLER_ID);
		  		// attribute containing "data parameter" for extension call
				element.setAttribute("data", "");
				// attribute containing "return value" of extension
				element.setAttribute("returnvalue", "");
		  		document.documentElement.appendChild(element);
		  		return element;
	  		} else {
	  			// element exists - return that
	  			return document.getElementById(Communicator.ELWMS_CALLER_ID);
	  		}
	  	} else {
	  		// some error...
	  		njAlert("dataclient.js - Communicator.createElement ERROR!");
	  		return null;
	  	}
	},
 
	/**
	 * calls the extension with JSON - data (object)
	 *
	 * @param {Object} data the data to transfer to extension - must be convertible to JSON
	 */
	call : function(data) {
		// create or get our element
		var element = Communicator.createElement();
		element.setAttribute("data", escape(data.toJSONString()));
		// create and fire custom Event to notify extension
		var ev = document.createEvent("Event");
		ev.initEvent(Communicator.ELWMS_EVENT_NAME, true, false);
		element.dispatchEvent(ev);
	},
 
	/**
	 * is called when the extensions fires ELWMS_EVENT_BACK_NAME - Event; data
	 * may be collected from <code>returnvalue</code>-Attribute.
	 *
	 * @param {Event} aEvent the event
	 */
	calledBack : function(aEvent) {
		// TODO: decide what to do here!
		njAlert("Communicator.calledBack : " + unescape(aEvent.target.getAttribute("returnvalue")));
	}
};
 
function func(aEvent) {
	Communicator.call({id:1100, name:"Ping"});
}
 
/**
 * on page load, the Communicator is initialized
 */
document.addEventListener("DOMContentLoaded", function(aEvent) {
	Communicator.init();
	// add event Listener on button to test...
	document.getElementById("communicator").addEventListener("click", func, true);
}, false);