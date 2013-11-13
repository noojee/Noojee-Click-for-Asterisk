var EXPORTED_SYMBOLS = ["Sequence"];

Components.utils.import("resource://noojeeclick/asterisk.jsm");
Components.utils.import("resource://noojeeclick/util.jsm");
Components.utils.import("resource://noojeeclick/prefs.jsm");
Components.utils.import("resource://noojeeclick/prompts.jsm");
Components.utils.import("resource://noojeeclick/statusbar.jsm");


/**
 * Sequence designed to run a series of ajax actions synchronously.
 * 
 * @param jobs
 *            list of Jobs to be processed
 * @param param
 *            parameter to pass to each job
 *            
 * @param initialising
 *   if true this sequence has been called as part of the initialization
 *   sequence.           
 * @return
 */
function Sequence(asterisk, xmlHttpRequest, jobs, param, initialising)
{
	const
	COMPLETE = 0;
	const
	RUNNING = 1;
	const
	ERROR = 2;

	njdebug("New Sequence created", "sequence: " + jobs + ":" + param);

	this.asterisk = asterisk;
	this.xmlHttpRequest = xmlHttpRequest;
	this.currentStep = -1;
	this.param = param;
	this.jobs = jobs;

	this.run = function()
	{
		try
		{
			njdebug("sequence", "sequence.run this=" + this);
			njdebug("sequence", "jobs=" + jobs);
			this.currentStep = 0;
			this.currentJob = this.jobs[this.currentStep];
			njdebug("sequence", "currentJob =" + this.currentJob);
			this.currentJob.run(this, param);
		}
		catch (e)
		{
			njerror("sequence", "sequence.run " + e);
		}
	}

	this.request = function(requestURL)
	{
		njdebug("sequence", "request this=" + this);

		// xmlHttpRequest.onreadystate = this.callback;
		this.xmlHttpRequest.onload = this.load;
		this.xmlHttpRequest.onerror = this.error;
		this.xmlHttpRequest.sequence = this;
		this.xmlHttpRequest.open("GET", requestURL, true);
		this.xmlHttpRequest.send("");

		njdebug("sequence", "request=" + requestURL);
		return true;
	}

	this.cancel = function()
	{
		// This is not necessarily sufficient if the dial has commenced.
		// We probably need to send a hangup message to asterisk
		// To do this we probably need the unique channel id.
		this.xmlHttpRequest.abort();
		statusbar.updateStatus("");
	}
	/*
	 * this.callback = function() { // debugger; njdebug("sequence", "callback this=" +
	 * this); var details = this; njdebug("sequence", "sequence.callback: " +
	 * details.readyState + ":" + details.status +":" + details.statusText +":" +
	 * details.responseHeader +":" + details.responseText);
	 * 
	 * if (details.readyState < 4) return;
	 * 
	 * if (details.readyState == 4 && details.status == 200) { njdebug("sequence", "reponse
	 * loaded"); this.sequence.load(); } else { njdebug("sequence", "response error,
	 * status=" + details.status); prompt.alert(details.responseText); } }
	 */
	this.load = function()
	{
		njdebug("sequence", "load this=" + this);
		var details = this;

		njdebug("sequence", "sequence.load: " + details.readyState + ":" + details.status + ":" + details.statusText + ":"
		        + details.responseHeader + ":" + details.responseText);

		var seq = this.sequence;

		// Check for an error which is buried in the 'responseText'
		var result = null;
		if (details.status == 200)
		{
			if (seq.currentJob.parseResponse)
			{
				result = seq.currentJob.parseResponse(details.responseText);
			}
			else
			{
				njdebug("sequence", "No response parser found for current job, using default parser");

				result = parseResponse(details.responseText);
				njdebug("sequence", "responseText=" + details.responseText);
				njdebug("sequence", "result.response=" + result.response);
				njdebug("sequence", "result.message=" + result.message);
			}

			// If handleResponse returns false then we abort the entire
			// sequence.
			if (!seq.currentJob.handleResponse(result))
			{
				njdebug("sequence", "sequence aborted see prior messages for details - forcing new login");
				// Whenever an error occurs we force a login as the server
				// may have reset.
				seq.asterisk.setLoggedIn(false);
				return;
			}

			// Only increment the step if the current job has finished
			if (!seq.currentJob.doContinue())
				seq.currentStep++;

			njdebug("sequence", "running step=" + seq.currentStep);
			njdebug("sequence", "job=" + getObjectClass(seq.jobs[seq.currentStep]));
			njdebug("sequence", "jobs.length=" + seq.jobs.length);

			if (seq.currentStep < seq.jobs.length)
			{
				seq.currentJob = seq.jobs[seq.currentStep];
				seq.currentJob.run(seq, param);
			}
			else
			{
				njdebug("sequence", "sequence complete");
			}
		}
		else if (details.status == 404)
		{
			prompt.error(details.statusText, "The requested URL was not found on this server. Check the prefix in http.conf matches the Noojee Click prefix on the advanced tab.");
		}
		else
		{
			njdebug("sequence", "response error, status=" + details.status);
			prompt.error(details.responseText);
		}

	}

	this.error = function()
	{
		try
		{
			var details = this;
			njdebug("sequence", "sequence.error called this=" + this);
			statusbar.resetIcon();
			//gAsterisk.updateState("");

			njdebug("sequence", "sequence.error: " + details.readyState + ":" + details.status + ":"
			        + details.responseHeader + ":" + details.responseXML + ":" + details.responseText);

			// Check if the current sequence has its own error handler and if so call it.
			var seq = this.sequence;
			if (seq.currentJob.error)
			{
				result = seq.currentJob.error(details.responseText);
			}
			else
			{
				if (details.responseText == null || details.responseText.length == 0)
				{
					njlog("Unexpected error responseText is empty, asterisk may be down.");
					if (!initialising)
						prompt.error(details.responseText, "Unable to connect to Asterisk. Asterisk may be down or your configuration may be incorrect.");
				}
				else
				{
					var result = parseResponse(details.responseText);
					njlog("Action failed " + result.message);
					prompt.error(result.response, result.message);
				}
			}
		}
		catch (e)
		{
			njerror("sequence", e);
		}
	}

	this.timeout = function()
	{
		njdebug("sequence", "requestTimeout");
		this.sequence.cancel();
	}

}
