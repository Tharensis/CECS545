// Global variables
var xCoords = [];
var yCoords = [];
var coordinates = [];

// BEGIN OBJECT DEFINITIONS 

function Point(x, y) {
	this.x = parseFloat(x);
	this.y = parseFloat(y);
}


// In the form of ax + by + c = 0
function Line(x1, y1, x2, y2) {
	this.a = (y2 - y1)/(x2 - x1);
	this.b = -1;
	this.c = y1 - this.a * x1;
}

// END OBJECT DEFINITIONS

// This function is called by the HTML file.
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
	coordinates.length = 0;

	var splitFile = fileData.split("\n");

	// Stores coordinate data in two global arrays after finding where the coordinates are in the file
	var bool_coordIndex = false;
	for(i = 0; i < splitFile.length - 1; i++) {
		// Checking where NODE_COORD_SECTION is
		if(!bool_coordIndex) {
			if(splitFile[i].indexOf("NODE_COORD_SECTION") == -1) {
				continue;
			} else {
				bool_coordIndex = true;
				continue;
			}
		}
		var splitLine = splitFile[i].split(" ");
		coordinates.push(new Point(splitLine[1], splitLine[2]));
	}

	if(!bool_coordIndex) {
		alert("ERROR: No NODE_COORD_SECTION found.");
		return;
	}

	var startTime = window.performance.now();
	var path = findPath();
	var endTime = window.performance.now();

	displayResults(path, null, null, null);

	//xCoords.length = 0;
	//yCoords.length = 0;
}

function findPath() {
	var path = [];
	var max = coordinates.length;

	if(coordinates.length <= 2) {
		alert("Trivial result for number of cities between 0 and 2, inclusive.");
		return;
	}

	// First two points are chosen randomly as there are no edges to consider
	for(i = 0; i < 2; i++) {
		path.push(coordinates.splice(Math.floor(Math.random() * coordinates.length), 1)[0]);
	}

	/*for(i = 0; i < max; i++) {
		path.push(coordinates[Math.floor(Math.random() * max * 4 + 1)]);
	}*/

	return path;
}

// Displays results on an HTML5 canvas
function displayResults(path, distance, time, averageArray) {
	
	var i;
	var textOffset = 3;
	var pointSize = 2;
	var canvasScale = 4;

	var canvas = document.getElementById("resultCanvas");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "black";
	ctx.scale(canvasScale, canvasScale);
	ctx.font = "3px Arial";

	// This loop corrects the y coordinates, so that y doesn't count
	// from the top of the canvas. It counts from the bottom
	for(i = 0; i < yCoords.length; i++) {
		yCoords[i] = (canvas.height / canvasScale) - parseFloat(yCoords[i]);
		yCoords[i] = yCoords[i].toString();
	}
	
	// Draw points
	for(i = 0; i < path.length; i++) {
		var point = path[i];
		var x = point.x;
		//var y = (canvas.height / canvasScale) - point.y;
		var y = point.y;

		ctx.fillRect(x - pointSize/2, y - pointSize/2, pointSize, pointSize);
		ctx.fillText(parseInt(i) + 1, x + pointSize, y + pointSize);
	}

	// Draw lines
	ctx.beginPath();
	ctx.strokeStyle="red";
	/*ctx.moveTo(coordinates[0].x, coordinates[0].y);
	for(i = 1; i < coordinates.length; i++) {
		ctx.lineTo(coordinates[i].x, coordinates[i].y);
		ctx.stroke();
	}*/
	
	ctx.moveTo(path[0].x, path[0].y);
	for(i = 1; i < path.length; i++) {
		ctx.lineTo(path[i].x, path[i].y);
	}
	ctx.stroke();

	// Calculating average time
	var average;
	var sum = 0;
	for(i in averageArray) {
		sum += averageArray[i];
	}

	ctx.fillText("Distance: " + distance, 5, 5);
	ctx.fillText("Time: " + time + "ms", 5, 8);
	ctx.fillText("Average: " + average + "ms", 5, 11);
	ctx.scale(1 / canvasScale, 1 / canvasScale);
}

function getDistance(perm) {
	var totalDistance = 0;

	var i = 0;
	for(i = 0; i < perm.length - 1; i++) {
		if(i != perm.length - 1) {
			var city2 = perm[i + 1] - 1;
			var city1 = perm[i] - 1;
		}
		var distance = Math.sqrt(Math.pow(xCoords[city2] - xCoords[city1], 2) + Math.pow(yCoords[city2] - yCoords[city1], 2));
		totalDistance += distance;
	}
	return totalDistance;
}
