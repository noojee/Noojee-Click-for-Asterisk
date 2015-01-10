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

/**
 * This class is used to emulate the chrome message passing interface.
 * 
 * In 
 * 
 * Message passing is not required in firefox so this just directly call the target function.
 * 
 *  
 **/
noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.backgroundMessageTo =
{

dial: function (phoneNo)
{
	if (theApp.asterisk.isConfigured())
		theApp.asterisk.getInstance().dial(phoneNo);
	else
		theApp.prompts.njAlert("Please configure Asterisk options first.");

},

hangup: function ()
{
	theApp.asterisk.getInstance().hangup();
},


};

}});


