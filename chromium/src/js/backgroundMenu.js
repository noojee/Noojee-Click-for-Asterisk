// Restores select box state to saved value from localStorage.
function init_menu() {

	$("#menu").menu();

	$("#menu").on('click', 'div', function(event) {
		switch ($(this).text()) {
		
//	    <command id="Tasks:noojeeClick.dial" oncommand="noojeeClick.handlers.dialMenuAction();"/>
//	    <command id="Tasks:noojeeClick.redial" oncommand="noojeeClick.handlers.redialMenuAction();"/>
//		<command id="Tasks:noojeeClick.switchCLID" oncommand="noojeeClick.handlers.clidQuickPickMenuAction();"/> 
//	    <command id="Tasks:noojeeClick.dialFromClipboard" oncommand="noojeeClick.handlers.dialFromClipboardMenuAction();"/>
//	    <command id="Tasks:noojeeClick.dialSelection" oncommand="noojeeClick.handlers.dialSelectionMenuAction();"/>
//	    <command id="Tasks:noojeeClick.dialDifferently" oncommand="noojeeClick.handlers.dialDifferentlyMenuAction();"/>
//	    <command id="Tasks:noojeeClick.configuration" oncommand="noojeeClick.prefs.onConfiguration();"/>
//		<command id="Tasks:noojeeClick.dialAddPattern" oncommand="noojeeClick.handlers.onAddDialPatternMenuAction();"/>
//		<command id="Tasks:noojeeClick.refresh" oncommand="noojeeClick.render.onRefresh();"/> 
//	    <command id="Tasks:noojeeClick.showClickIcons" oncommand="noojeeClick.handlers.onShowClickIcons();"/>
//	    <command id="Tasks:noojeeClick.hangup" oncommand="noojeeClick.handlers.onHangup();"/>

		case "Dial...":
			noojeeClick.handlers.dialMenuAction();
			break;

		case "Redial":
			noojeeClick.handlers.redialMenuAction();
			break;

		case "Dial from Clipboard...":
			noojeeClick.handlers.dialFromClipboardMenuAction();
			break;

		case "Configuration...":
			noojeeClick.prefs.onConfiguration();
			break;

		case "Show Click Icons":
			chrome.tabs.getSelected(null, function(tab) 
			{
				// Send a request to the content script to re-render the click icons.
				chrome.tabs.sendRequest(tab.id, {action: "showClickIcons"}, function(response) 
				{
					console.log(response);
				});
			});
			break;

		case "Refresh":
			chrome.tabs.getSelected(null, function(tab) 
			{
				// Send a request to the content script the current tab to re-render the click icons.
				chrome.tabs.sendRequest(tab.id, {action: "refresh"}, function(response) 
				{
					console.log(response);
				});
			});
			break;
			
		case "Switch CLID":
			noojeeClick.handlers.clidQuickPickMenuAction();
			break;
		}

	});

}

$(document).ready(function() {
	init_menu();
});