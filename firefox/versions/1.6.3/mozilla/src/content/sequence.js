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
 
 
noojeeClick.ns(function() { with (noojeeClick.LIB) {

theApp.sequence =
{
Sequence: function (jobs, param, initialising)
{
	const
	COMPLETE = 0;
	const
	RUNNING = 1;
	const
	ERROR = 2;

	var xmlHttpRequest;

	theApp.util.njdebug("sequence", "sequence: " + jobs + ":" + param);

	this.currentStep = -1;
	this.param = param;
	this.jobs = jobs;

	this.run = function()
	{
		try
		{
			theApp.util.njdebug("sequence", "sequence.run this=" + this);
			theApp.util.njdebug("sequence", "jobs=" + jobs);
			if (navigator.onLine)
			{
				this.currentStep = 0;
				this.currentJob = this.jobs[this.currentStep];
				theApp.util.njdebug("sequence", "currentJob =" + this.currentJob);
				this.currentJob.run(this, param);
			}
			else
				theApp.prompts.njAlert("The browser must be online in order to dial.");
		}
		catch (e)
		{
			theApp.util.njlog(e);
			theApp.util.showException("run", e);
		}
	}

	this.request = function(requestURL)
	{
		theApp.util.njdebug("sequence", "request this=" + this);

		xmlHttpRequest = new XMLHttpRequest();
		// xmlHttpRequest.onreadystate = this.callback;
		xmlHttpRequest.onload = this.load;
		xmlHttpRequest.onerror = this.error;
		xmlHttpRequest.sequence = this;
		xmlHttpRequest.open("GET", requestURL, true);
		xmlHttpRequest.send("");

		theApp.util.njdebug("sequence", "request=" + requestURL);
		return true;
	}

	this.cancel = function()
	{
		// This is not necessarily sufficient if the dial has commenced.
		// We probably need to send a hangup message to asterisk
		// To do this we probably need the unique channel id.
		xmlHttpRequest.abort();
		theApp.dialstatus.getInstance().updateStatus("");
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
	 * status=" + details.status); theApp.prompts.njAlert(details.responseText); } }
	 */
	this.load = function()
	{
		theApp.util.njdebug("sequence", "load this=" + this);
		var details = this;

		theApp.util.njdebug("sequence", "sequence.load: " + details.readyState + ":" + details.status + ":" + details.statusText + ":"
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
				theApp.util.njdebug("sequence", "No response parser found for current job, using default parser");

				result = parseResponse(details.responseText);
				theApp.util.njdebug("sequence", "responseText=" + details.responseText);
				theApp.util.njdebug("sequence", "result.response=" + result.response);
				theApp.util.njdebug("sequence", "result.message=" + result.message);
			}

			// If handleResponse returns false then we abort the entire
			// sequence.
			if (seq.currentJob.handleResponse(result))
			{
				theApp.util.njdebug("sequence", "sequence completed");
				return;
			}

			// Only increment the step if the current job has finished
			if (!seq.currentJob.doContinue())
				seq.currentStep++;

			theApp.util.njdebug("sequence", "running step=" + seq.currentStep);
			theApp.util.njdebug("sequence", "jobs=" + seq.jobs);
			theApp.util.njdebug("sequence", "jobs.length=" + seq.jobs.length);

			if (seq.currentStep < seq.jobs.length)
			{
				seq.currentJob = seq.jobs[seq.currentStep];
				seq.currentJob.run(seq, param);
			}
			else
			{
				theApp.util.njdebug("sequence", "sequence complete");
			}
		}
		else if (details.status == 404)
		{
			theApp.util.showError(details.statusText, "The requested URL was not found on this server. Check the prefix in http.conf matches the Noojee Click prefix on the advanced tab.");
		}
		else
		{
			theApp.util.njdebug("sequence", "response error, status=" + details.status);
			theApp.prompts.njAlert(details.responseText);
		}

	}

	this.error = function()
	{
		try
		{
			var details = this;
			theApp.util.njdebug("sequence", "error this=" + this);
			theApp.noojeeclick.resetIcon();
			theApp.asterisk.getInstance().updateState("");

			theApp.util.njdebug("sequence", "sequence.error: " + details.readyState + ":" + details.status + ":"
			// + details.statusText +":"
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
					theApp.util.njlog("Unexpected error responseText is empty, asterisk may be down.");
					if (!initialising)
						theApp.util.showError(details.responseText, "Unable to connect to Asterisk. Asterisk may be down or your configuration may be incorrect.");
				}
				else
				{
					var result = parseResponse(details.responseText);
					theApp.util.njlog("Action failed " + result.message);
					theApp.util.showError(result.response, result.message);
				}
			}
		}
		catch (e)
		{
			theApp.util.showException("error", e);
		}
	}

	this.timeout = function()
	{
		theApp.util.njdebug("sequence", "requestTimeout");
		this.sequence.cancel();
	}

}


}

}});