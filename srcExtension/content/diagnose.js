noojeeClick.ns(function()
{
	with (noojeeClick.LIB)
	{

		theApp.diagnose =
		{

			onDiagnoseLoaded : function()
			{
				if (window.document != null)
				{
					var diagConsole = window.document.getElementById('njDiagConsole');

					diagConsole.addText("Sorry, the connection tester isn't implemented as yet :< .");
					// Asterisk.test()
				}

			}

		};

	}
});
