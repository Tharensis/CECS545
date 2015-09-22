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


// In the form of ax + by + c = 0
// Not actually needed anymore, but too lazy to change code
function Line(city1, city2) {

	this.a = (city2.y - city1.y)/(city2.x - city1.x);
	this.b = -1;
	this.c = city1.y - this.a * city1.x;
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

function findPath(coordinates) {
	// Coordinates contains the list of cities not currently used yet
	// Path contains the current path so far.
	var path = [];
	// Contains the equations of the lines between city path[i] and city path[i + 1]
	var edges = [];
	// Contains the cities added (in order)
	var added = [];
	

	var max = coordinates.length;

	if(coordinates.length <= 2) {
		alert("Trivial result for number of cities between 0 and 2, inclusive.");
		return;
	}

	// First two points are chosen randomly as there are no edges to consider
	for(i = 0; i < 2; i++) {
		path.push(coordinates.splice(Math.floor(Math.random() * coordinates.length), 1)[0]);
		added.push(path[i].num);
	}
	path.push(JSON.parse(JSON.stringify(path[0])));
	
	// Gets first edge hard-coded. Every other edge will be dynamic
	edges.push(new Line(path[0], path[1]));

	while(coordinates.length) {
		var shortest = {city: 0, 					// Index in coordinates array
						edge: 0, 					// Index in the edges array
						distance: Number.MAX_VALUE	// Distance between city and edge
		};

		// Finding next point to insert
		for(i = 0; i < coordinates.length; i++) {

			// Init values for edge iteration
			var currentShortestDistance = Number.MAX_VALUE;
			var currentShortestEdge = 0;
			for(j = 0; j < path.length - 1; j++) {
				var currentDistance = lineSegmentDistance(coordinates[i], path[j], path[j+1]);
				if(currentDistance < currentShortestDistance) {
					currentShortestEdge = j;
					currentShortestDistance = currentDistance;
				}
			}

			if(currentShortestDistance < shortest.distance) {
				shortest.city = i;
				shortest.edge = currentShortestEdge;
				shortest.distance = currentShortestDistance;
			}
		}

		// Inserting edge
		var toInsert = coordinates.splice(shortest.city, 1);
		path.splice(shortest.edge + 1, 0, toInsert[0]);
		edges[shortest.edge] = new Line(path[shortest.edge], path[shortest.edge + 1]);
		edges.splice(shortest.edge + 1, 0, new Line(path[shortest.edge + 1], path[shortest.edge + 2]));

		added.push(toInsert[toInsert.length - 1].num);
	}
	return { path:path, added:added};
}


function lineSegmentDistance(point, end1, end2) {
	var l2 = Math.pow(end1.x - end2.x, 2) + Math.pow(end1.y - end2.y, 2);
	if(l2 == 0) {
		return Math.sqrt(Math.pow(point.x - end1.x, 2) + Math.pow(point.y - end1.y, 2));
	}
	var t0 = ((point.x - end1.x) * (end2.x - end1.x) + (point.y - end1.y) * (end2.y - end1.y)) / l2;
	if(t0 < 0) {
		return Math.sqrt(Math.pow(point.x - end1.x, 2) + Math.pow(point.y - end1.y, 2));
	} else if (t0 >= 1) {
		return Math.sqrt(Math.pow(point.x - end2.x, 2) + Math.pow(point.y - end2.y, 2));
	} else {
		var x = end1.x + t0 * (end2.x - end1.x);
		var y = end1.y + t0 * (end2.y - end1.y);

		return Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
	}
}

// Displays results on an HTML5 canvas
function displayResults(path, distance, time, added) {
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
		console.log(path[i]);
		console.log(i);
	}
	
	var addedArea = document.getElementById("addedList");
	var pathArea = document.getElementById("path");
	addedArea.innerHTML = "<b>Added in order:</b> " + added;
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
