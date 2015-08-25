function calculate(filePath) {
	readFile(filePath, function(result){ console.log(result); });
}

function readFile(filePath, callback) {
	var reader = new FileReader();
	if(filePath && filePath.files[0]) {
		reader.onload = function(e) {
			// Returns the value from the anonymous function
			callback(e.target.result);
		}
		reader.readAsText(filePath.files[0]);
	} else {
		alert("No file selected.");
	}
}
