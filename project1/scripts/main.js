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
	var array = [];
	var n = 0;
	for(n = 0; n < xCoords.length; n++) {
		array[n] = n;
	}

	var totalDistance = 0;
	var minimumDistance = 0;
	var minimumPath;

	var startTime = new Date().getTime();

	for(n = 0; n < factorial(array.length - 1); n++) {
		if(n == 0) {
			totalDistance = calculateDistance(array);
			minimumDistance = totalDistance;
			minimumPath = JSON.parse(JSON.stringify(array));
		} else {
			nextPermute(array);
			totalDistance = calculateDistance(array);
		}
		if(totalDistance < minimumDistance) {
			minimumDistance = totalDistance;
			minimumPath = JSON.parse(JSON.stringify(array));
		}
		//console.log(array);
	}

	var endTime = new Date().getTime();

	// Adds the original city to the end of the path.
	minimumPath.push(minimumPath[0]);

	displayResult(minimumPath, minimumDistance, endTime - startTime);

	xCoords.length = 0;
	yCoords.length = 0;
}

function displayResult(path, distance, time) {
	var node = document.createElement("DIV");
	var textnode = document.createTextNode("Number of Cities: " + (path.length - 1) + " Path: " + path + " Distance: " + distance + " Time: " + time/1000 + "s");
	node.appendChild(textnode);
	document.getElementById("results").appendChild(node);
}

// Generates all permutations based on number of cities
function nextPermute(array) {

	var r = array.length;
	// This is modified code from my past CECS 310 project
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

	return array;
}

// Calculates the distance for a given permutation
function calculateDistance(perm) {
	var totalDistance = 0;

	var i = 0;
	for(i = 0; i < perm.length; i++) {
		// If last iteration, complete round trip
		if(i != perm.length - 1) {
			var x2 = xCoords[perm[i + 1]];
			var x1 = xCoords[perm[i]];
			var y2 = yCoords[perm[i + 1]];
			var y1 = yCoords[perm[i]];
		} else {
			var x2 = xCoords[perm[0]];
			var x1 = xCoords[perm[i]];
			var y2 = yCoords[perm[0]];
			var y1 = yCoords[perm[i]];
		}

		var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
		totalDistance += distance;
	}
	return totalDistance;
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
