// Global variables
var xCoords = [];
var yCoords = [];
var runTimes = [];

// BEGIN OBJECT DEFINITIONS 

function City(x, y, num) {
	this.x = parseFloat(x);
	this.y = parseFloat(y);
	this.num = num;
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
	var coordinates = [];
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
		coordinates.push(new City(splitLine[1], splitLine[2], splitLine[0]));
	}

	if(!bool_coordIndex) {
		alert("ERROR: No NODE_COORD_SECTION found.");
		return;
	}

	var startTime = window.performance.now();

	var path = findPath(coordinates);

	var endTime = window.performance.now();
	var distance = getDistance(path.path);

	displayResults(path.path, distance, endTime - startTime, path.added);
}

// Displays results on an HTML5 canvas
function displayResults(path, distance, time) {
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
		ctx.fillText(point.num, x + pointSize, y + pointSize);
	}
	
	// Draw lines
	ctx.beginPath();
	ctx.strokeStyle="red";
		
	ctx.moveTo(path[0].x, path[0].y);
	for(i = 1; i < path.length; i++) {
		ctx.lineTo(path[i].x, path[i].y);
	}
	ctx.stroke();

	// Calculating average time
	runTimes.push(time);
	var average;
	var sum = 0;
	for(i = 0; i < runTimes.length; i++) {
		sum += runTimes[i];
	}
	average = sum / runTimes.length;

	ctx.fillStyle = "#000000";
	ctx.fillText("Distance: " + distance, 125, 5);
	ctx.fillText("Time: " + time + "ms", 125, 8);
	ctx.fillText("Average: " + average + "ms", 125, 11);
	ctx.scale(1 / canvasScale, 1 / canvasScale);

	var pathString = "";

	for(i = 0; i < path.length; i++) {
		if(i != 0) {
			pathString += ",";
		}
		pathString += path[i].num;
	}
	
	var pathArea = document.getElementById("path");
	pathArea.innerHTML = "<b>Path:</b> " + pathString;
}

function getDistance(path) {
	var totalDistance = 0;

	for(i = 0; i < path.length - 1; i++) {
		var point1 = path[i];
		var point2 = path[i + 1];

		var distance = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
		totalDistance += distance;
	}
	return totalDistance;
}

function sleep(delay) {
	var start = new Date().getTime();
	while (new Date().getTime() < start + delay);
}
