/*
 * Set of API's which allows a web page to control NoojeeClck.
 */

noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.api =
{

/*
 * Call the init method to make the api available to normal hTML pages.
 * 
 */

njClickAPI: new Object(),


/* This function must be called for each html page that needs access
 * 
 */
njAPIonLoad: function (document)
{
	theApp.logging.njdebug("api", "njAPIonLoad called");
	//var HTMLWin = document.getElementById("htmlIFrame").contentWindow; 
	//HTMLWin.njClickAPI = njClickAPI;
	
	// disabled for the moment until I understand the security implications.
	document.njClickAPI = this.njClickAPI;
},

/* Call this method to modify the current extension.
 * 
 */
njSetExtension: function (extension)
{
	setValue("extension", extension);
},

njAPIinit: function ()
{
	theApp.logging.njdebug("api", "njAPIinit called");
	// disabled until I understand the security implications.
	this.njClickAPI.setExtension = this.njSetExtension;
},


/**

eg: // in your XUL JS file Global = new Object(); Global.foo = function() { theApp.prompts.njAlert('foo'); };

	Now you need to get a reference to your HTML window and add a reference back to Global.

	eg: var HTMLWin = document.getElementById("htmlIFrame").contentWindow; HTMLWin.XULContext = Global;

	Now you should be able to call your methods through this object from within your HTML file:

	eg: // in your HTML file XULContext.foo();
	
*/	 


};

}});

