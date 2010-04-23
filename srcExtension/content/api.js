/*
 * Set of API's which allows a web page to control NoojeeClck.
 */


/*
 * Call the init method to make the api available to normal hTML pages.
 * 
 */

var njClickAPI = new Object();


/* This function must be called for each html page that needs access
 * 
 */
function njAPIonLoad(document)
{
	njdebug("api", "njAPIonLoad called");
	//var HTMLWin = document.getElementById("htmlIFrame").contentWindow; 
	//HTMLWin.njClickAPI = njClickAPI;
	
	// disabled for the moment until I understand the security implications.
	document.njClickAPI = njClickAPI;
}

/* Call this method to modify the current extension.
 * 
 */
function njSetExtension(extension)
{
	setValue("extension", extension);
}

function njAPIinit()
{
	njdebug("api", "njAPIinit called");
	// disabled until I understand the security implications.
	njClickAPI.setExtension = njSetExtension;
}


/**

eg: // in your XUL JS file Global = new Object(); Global.foo = function() { njAlert('foo'); };

	Now you need to get a reference to your HTML window and add a reference back to Global.

	eg: var HTMLWin = document.getElementById("htmlIFrame").contentWindow; HTMLWin.XULContext = Global;

	Now you should be able to call your methods through this object from within your HTML file:

	eg: // in your HTML file XULContext.foo();
	
*/	 