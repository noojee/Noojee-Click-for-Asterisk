// Restores select box state to saved value from localStorage.
function init_menu() {

	$("#menu").menu();

	$("#menu").on('click', 'div', function(event) {
		switch ($(this).text()) {
		
		case "Dial...":
			noojeeClick.handlersMenu.dialMenuAction();
			break;

		case "Redial":
			noojeeClick.handlersMenu.redialMenuAction();
			break;

		case "Dial from Clipboard...":
			noojeeClick.handlersMenu.dialFromClipboardMenuAction();
			break;

		case "Configuration...":
			noojeeClick.prefs.onConfiguration();
			break;

		case "Show Click Icons":
			noojeeClick.contentScriptMessageTo.showClickIcons();
			break;

		case "Refresh":
			noojeeClick.contentScriptMessageTo.refresh();
			break;
			
		case "Switch CLID":
			noojeeClick.handlersMenu.clidQuickPickMenuAction();
			break;
		}

	});

}

$(document).ready(function() {
	init_menu();
});