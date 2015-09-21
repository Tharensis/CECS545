// Global variables
var xCoords = [];
var yCoords = [];

// BEGIN OBJECT DEFINITIONS 

function City(x, y, num) {
	this.x = parseFloat(x);
	this.y = parseFloat(y);
	this.num = num;
}


// In the form of ax + by + c = 0
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

	//displayResults(path, null, null, null);

	//xCoords.length = 0;
	//yCoords.length = 0;
}

function findPath(coordinates) {
	// Coordinates contains the list of cities not currently used yet
	// Path contains the current path so far.
	var path = [];
	// Contains the equations of the lines between city path[i] and city path[i + 1]
	var edges = [];
	

	var max = coordinates.length;

	if(coordinates.length <= 2) {
		alert("Trivial result for number of cities between 0 and 2, inclusive.");
		return;
	}

	// First two points are chosen randomly as there are no edges to consider
	for(i = 0; i < 2; i++) {
		path.push(coordinates.splice(Math.floor(Math.random() * coordinates.length), 1)[0]);
	}
	path.push(JSON.parse(JSON.stringify(path[0])));
	
	//for(i = 0; i < 2; i++) {
	//	path.push(coordinates.splice(0, 1)[0]);
	//}

	// Gets first edge hard-coded. Every other edge will be dynamic
	edges.push(new Line(path[0], path[1]));

	while(coordinates.length) {
	//for(derp = 0; derp < 5; derp++) {
		var shortest = {city: 0, 					// Index in coordinates array
						edge: 0, 					// Index in the edges array
						distance: Number.MAX_VALUE	// Distance between city and edge
		};

		// Finding next point to insert
		for(i = 0; i < coordinates.length; i++) {
			//console.log("CITY: " + i);

			// Init values for edge iteration
			var currentShortestDistance = Number.MAX_VALUE;
			var currentShortestEdge = 0;
			for(j = 0; j < edges.length; j++) {
			//	console.log("EDGE: " + j);
				//var currentDistance = pointToLineDistance(coordinates[i], edges[j]);
				var currentDistance = distToSegment(coordinates[i], path[j], path[j+1]);
				if(currentDistance < currentShortestDistance) {
					currentShortestEdge = j;
					currentShortestDistance = currentDistance;
				}
			}

			if(currentShortestDistance < shortest.distance) {
				shortest.city = i;
				shortest.edge = currentShortestEdge;
				shortest.distance = currentShortestDistance;
			console.log("Current shortest city: " + coordinates[shortest.city].num);
			console.log("Current shortest edge: " + shortest.edge);
			console.log("Current shortest distance: " + shortest.distance);
			}
		}

		// Inserting edge
		var toInsert = coordinates.splice(shortest.city, 1);
		console.log(shortest.edge);
		path.splice(shortest.edge + 1, 0, toInsert[0]);
		edges[shortest.edge] = new Line(path[shortest.edge], path[shortest.edge + 1]);
		edges.splice(shortest.edge + 1, 0, new Line(path[shortest.edge + 1], path[shortest.edge + 2]));
	}

	displayResults(path, null, null, null, coordinates);

	return path;
}

function pointToLineDistance(point, line) {
	var abs = Math.abs(line.a * point.x + line.b * point.y + line.c);
	var sqrt = Math.sqrt(Math.pow(line.a, 2) + Math.pow(line.b, 2));

	return abs / sqrt;
}

function lineSegmentDistance(point, end1, end2) {
	
}

// TODO WRITE MY OWN FUNCTION
function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w) {
	  var l2 = dist2(v, w);
	    if (l2 == 0) return dist2(p, v);
		  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
		    if (t < 0) return dist2(p, v);
			  if (t > 1) return dist2(p, w);
			    return dist2(p, { x: v.x + t * (w.x - v.x),
					                    y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

// Displays results on an HTML5 canvas
function displayResults(path, distance, time, averageArray, allCoords) {
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
	// TODO REMOVE
	for(i = 0; i < allCoords.length; i++) {
		var point = allCoords[i];
		var x = point.x;
		//var y = (canvas.height / canvasScale) - point.y;
		var y = point.y;

		ctx.fillRect(x - pointSize/2, y - pointSize/2, pointSize, pointSize);
		ctx.fillText(point.num, x + pointSize, y + pointSize);
	}
	// TODO REMOVE END

	// Draw lines
	ctx.beginPath();
	ctx.strokeStyle="red";
		
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

	function sleep(delay) {
		    var start = new Date().getTime();
			    while (new Date().getTime() < start + delay);
				  }
