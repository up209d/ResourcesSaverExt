console.log('Hello from -> Devtool');
chrome.devtools.panels.create(
	"ResourceSaver",
	"icon.gif",
	"content.html",
	function(panel) { 
		console.log("Content is loaded to panel"); 
	}
);