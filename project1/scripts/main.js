// Global variables
var xCoords = [];
var yCoords = [];
var distanceTable = [];

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

	generateDistanceTable();

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
			//totalDistance = calculateDistance(array);
			totalDistance = getDistance(array);
			minimumDistance = totalDistance;
			minimumPath = JSON.parse(JSON.stringify(array));
		} else {
			nextPermute(array);
			//totalDistance = calculateDistance(array);
			totalDistance = getDistance(array);
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

function getDistance(perm) {
	var totalDistance = 0;

	var i = 0;
	for(i = 0; i < perm.length; i++) {
		if(i != perm.length - 1) {
			var city2 = perm[i + 1];
			var city1 = perm[i];
		} else {
			var city2 = perm[0];
			var city1 = perm[i];
		}
		var distance = distanceTable[city1][city2];
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

// Generates lookup table based on point data
function generateDistanceTable() {
	var x = 0;
	var y = 0;
	create2DArray();
	for(x = 0; x < xCoords.length; x++) {
		for(y = 0; y < yCoords.length; y++) {
			distanceTable[x][y] = distance(x, y);
			console.log(x + " " + y);
		}
	}
}

function create2DArray() {
	for (var i=0;i<xCoords.length;i++) {
		distanceTable[i] = [];
	}
}

function distance(city1, city2) {
	var x2 = xCoords[city2];
	var x1 = xCoords[city1];
	var y2 = yCoords[city2];
	var y1 = yCoords[city1];

	var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	return distance;
}

function sleep(milliseconds) {
	  var start = new Date().getTime();
	    for (var i = 0; i < 1e7; i++) {
			    if ((new Date().getTime() - start) > milliseconds){
					      break;
						      }
				  }
}
