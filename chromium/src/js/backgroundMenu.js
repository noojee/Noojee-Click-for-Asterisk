// Restores select box state to saved value from localStorage.
function init_menu() {

	$("#menu").menu();

	$("#menu").on('click', 'div', function(event) {
		switch ($(this).text()) {
		
		case "Dial...":
			noojeeClick.handlersMenu.dialMenuAction();
			window.close();
			break;

		case "Redial":
			noojeeClick.handlersMenu.redialMenuAction();
			window.close();
			break;

		case "Dial from Clipboard...":
			noojeeClick.handlersMenu.dialFromClipboardMenuAction();
			window.close();
			break;

		case "Configuration...":
			noojeeClick.handlersMenu.showConfiguration();
			break;

		case "Show Click Icons":
			noojeeClick.handlersMenu.showClickIcons();
			window.close();
			break;

		case "Refresh":
			noojeeClick.handlersMenu.refresh();
			window.close();
			break;
			
		case "Switch CLID":
			noojeeClick.handlersMenu.clidQuickPickMenuAction();
			window.close();
			break;
		}

	});

}


$(document).ready(function() {
	init_menu();
});