// Global variables
var xCoords = [];
var yCoords = [];

function main(filePath) {
	readFile(filePath);
	// Sent to read the file
}

// Reads the provided file to store.
function readFile(filePath) {
	var reader = new FileReader();
	if(filePath && filePath.files[0]) {
		reader.onload = function(e) {
			// Sends result of the file to parseData
			parseData(e.target.result);
		}
		reader.readAsText(filePath.files[0]);
	} else {
		alert("No file selected.");
	}
}

function parseData(fileData) {
	var splitFile = fileData.split("\n");

	// Stores coordinate data in two global arrays
	for(i = 7; i < splitFile.length - 1; i++) {
		var splitLine = splitFile[i].split(" ");
		xCoords[i - 7] = splitLine[1];
		yCoords[i - 7] = splitLine[2];
	}

	// Fills array with initial permutation of cities
	var permutations = [];
	for(i in xCoords) {
		permutations[i] = i;
	}

	permute(permutations);
	console.log("Done: " + permutations.length);
}

// Generates permutations based on number of cities
function permute(array) {

	var i = 0;
	var r = array.length;
	// This is modified code from my past CECS 310 project
	for(i = 1; i < factorial(r); i++) {
		var m = r - 2;
		while(array[m] > array[m + 1]) {
			m--;
		}

		var k = r - 1;
		while(array[m] > array[k]) {
			k--;
		}

		var tmp = array[m];
		array[m] = array[k];
		array[k] = tmp;

		var p = m + 1;
		var q = r - 1;

		while(p < q) {
			var tmp = array[p];
			array[p] = array[q];
			array[q] = tmp;
			p++;
			q--;
		}
	}
}

// Math functions
function factorial(num) {
	var result = 1;
	for(i = 1; i <= num; i++) {
		result *= i;
		
	}
	return result;
}

function sleep(milliseconds) {
	  var start = new Date().getTime();
	    for (var i = 0; i < 1e7; i++) {
			    if ((new Date().getTime() - start) > milliseconds){
					      break;
						      }
				  }
}
