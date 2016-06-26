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
 * Sequence designed to run a series of ajax actions synchronously.
 * 
 * @param jobs
 *            list of Jobs to be processed
 * @param param
 *            parameter to pass to each job
 * 
 * @param initialising
 *            if true this sequence has been called as part of the
 *            initialization sequence.
 * @return
 */



var sequence = ( function( window, undefined ) 
{
	function Sequence(jobs, param, initialising)
	{
	    const COMPLETE = 0;
	    const RUNNING = 1;
	    const ERROR = 2;
	
	    var xmlHttpRequest = null;
	
	    logging.getInstance().njdebug("sequence", "sequence: " + job.toString(jobs) + ":" + param);
	
	    this.currentStep = -1;
	    this.currentJob = null;
	    this.param = param;
	    this.jobs = jobs;
	
	    this.run = function()
	    {
	        var self = this;
	        // Run the sequence in the background so the dial
			// doesn't tie up the UI.
	        window.setTimeout(function(self)
	        {
		        self.runCallback(self);
	        }, 0, self);
	    };
	
	    this.runCallback = function(self)
	    {
	        try
	        {
		        logging.getInstance().njdebug("sequence", "jobs=" + job.toString(jobs));
		        if (navigator.onLine)
		        {
			        self.currentStep = 0;
			        self.currentJob = self.jobs[self.currentStep];
			        logging.getInstance().njdebug("sequence", "currentJob =" + self.currentJob.name);
			        self.currentJob.run(self, param);
		        }
		        else
			        prompts.njAlert("The browser must be online in order to dial.");
	        }
	        catch (e)
	        {
		        logging.getInstance().njerror(e);
		        util.showException("sequence.runCallback", e);
	        }
	    };
	
	    this.request = function(requestURL)
	    {
	    	logging.getInstance().njdebug("sequence", "Sending request URL=" + requestURL);
	    	
	        xmlHttpRequest = new XMLHttpRequest();
	        // xmlHttpRequest.onreadystate = this.callback;
	        xmlHttpRequest.onload = this.load;
	        xmlHttpRequest.onerror = this.error;
	        xmlHttpRequest.sequence = this;
	        xmlHttpRequest.open("GET", requestURL, true);
	        xmlHttpRequest.send("");
	
	        logging.getInstance().njdebug("sequence", "request=" + requestURL);
	        return true;
	    };
	
	    this.cancel = function()
	    {
	        // This is not necessarily sufficient if the dial
			// has commenced.
	        // We probably need to send a hangup message to
			// asterisk
	        // To do this we probably need the unique channel
			// id.
	        xmlHttpRequest.abort();
	        dialstatus.getInstance().updateStatus("");
	    };
	    /*
		 * this.callback = function() { // debugger;
		 * njdebug("sequence", "callback this=" + this); var
		 * details = this; njdebug("sequence",
		 * "sequence.callback: " + details.readyState + ":" +
		 * details.status +":" + details.statusText +":" +
		 * details.responseHeader +":" + details.responseText);
		 * 
		 * if (details.readyState < 4) return;
		 * 
		 * if (details.readyState == 4 && details.status == 200) {
		 * njdebug("sequence", "reponse loaded");
		 * this.sequence.load(); } else { njdebug("sequence",
		 * "response error, status=" + details.status);
		 * prompts.njAlert(details.responseText); } }
		 */
	    this.load = function()
	    {
	        var details = this;
	
	        // logging.getInstance().njdebug("sequence", "sequence.load: "
			// + details.readyState + ":" + details.status + ":"
			// + details.statusText + ":"
	        // + details.responseHeader + ":" +
			// details.responseText);
	
	        var seq = this.sequence;
	
	        // Check for an error which is buried in the
			// 'responseText'
	        var result = null;
	        if (details.status == 200)
	        {
		        if (seq.currentJob.parseResponse)
		        {
			        result = seq.currentJob.parseResponse(details.responseText);
		        }
		        else
		        {
			        logging.getInstance().njdebug("sequence",
			                "No response parser found for current job, using default parser");
	
			        result = parseResponse(details.responseText);
			        logging.getInstance().njdebug("sequence", "responseText=" + details.responseText);
			        logging.getInstance().njdebug("sequence", "result.response=" + result.response);
			        logging.getInstance().njdebug("sequence", "result.message=" + result.message);
		        }
		        
		        if (result.response != "ignore")
		        {
			        // If handleResponse returns false then we abort
					// the entire
			        // sequence.
			        if (seq.currentJob.handleResponse(result))
			        {
				        logging.getInstance().njdebug("sequence", "sequence completed");
				        return;
			        }
	
			        // Only increment the step if the current job
					// has finished
			        if (!seq.currentJob.doContinue()) 
			        	seq.currentStep++;
	
			        logging.getInstance().njdebug("sequence", "running step=" + seq.currentStep);
			        logging.getInstance().njdebug("sequence", "jobs=" + job.toString(seq.jobs));
	
			        if (seq.currentStep < seq.jobs.length)
			        {
				        seq.currentJob = seq.jobs[seq.currentStep];
				        seq.currentJob.run(seq, param);
			        }
			        else
			        {
				        logging.getInstance().njdebug("sequence", "sequence complete");
			        }
		        }
	        }
	        else if (details.status == 404)
	        {
		        util
		                .showError(
		                        details.statusText,
		                        "The requested URL was not found on this server. Check the prefix in http.conf matches the Noojee Click prefix on the advanced tab.");
	        }
	        else
	        {
		        logging.getInstance().njdebug("sequence", "response error, status=" + details.status);
		        prompts.njAlert(details.responseText);
	        }
	
	    };
	
	    this.error = function()
	    {
	        try
	        {
		        var details = this;
		        var seq = this.sequence;
		        logging.getInstance().njdebug("sequence", "error this=" + seq.currentJob.name);
		        noojeeclick.resetIcon();
		        asterisk.getInstance().updateState("");
	
		        logging.getInstance().njdebug("sequence", "sequence.error: " + details.readyState + ":" + details.status
		                + ":"
		                // + details.statusText +":"
		                + details.responseHeader + ":" + details.responseXML + ":" + details.responseText);
	
		        // Check if the current sequence has its own
				// error handler and if so call it.
	
		        if (seq.currentJob.error)
		        {
			        result = seq.currentJob.error(details.responseText);
		        }
		        else
		        {
			        if (details.responseText === null || details.responseText.length === 0)
			        {
				        logging.getInstance().njlog("Unexpected error responseText is empty, asterisk may be down.");
				        if (!initialising)
				            util
				                    .showError(details.responseText,
				                            "Unable to connect to Asterisk. Asterisk may be down or your configuration may be incorrect.");
			        }
			        else
			        {
				        var result = parseResponse(details.responseText);
				        logging.getInstance().njlog("Action failed " + result.message);
				        util.showError(result.response, result.message);
			        }
		        }
	        }
	        catch (e)
	        {
		        util.showException("sequence.error", e);
	        }
	    };
	
	    this.timeout = function()
	    {
	        logging.getInstance().njdebug("sequence", "requestTimeout");
	        this.sequence.cancel();
	    };
	
	}
	
	return 
	{
		Sequence : Sequence,
	};
		
} )( window );
