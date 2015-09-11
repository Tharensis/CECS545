// Global variables
var xCoords = [];
var yCoords = [];
var avgBreadth = [];
var avgDepth = [];

// Directed graph containing the city connection
var graph = {
			1: [2, 3, 4],
			2: [3],
			3: [4, 5],
			4: [5, 6, 7],
			5: [7, 8],
			6: [8],
			7: [9, 10],
			8: [9, 10, 11],
			9: [11],
			10:[11]
}

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
	var splitFile = fileData.split("\n");

	// Stores coordinate data in two global arrays after finding where the coordinates are in the file
	var bool_coordIndex = false;
	for(i = 0; i < splitFile.length - 1; i++) {
		// Checking where NODE_COORD_SECTION is
		if(!bool_coordIndex && splitFile[i].indexOf("NODE_COORD_SECTION") != -1) {
			bool_coordIndex = true;
			continue;
		}
		var splitLine = splitFile[i].split(" ");
		xCoords[splitLine[0] - 1] = splitLine[1];
		yCoords[splitLine[0] - 1] = splitLine[2];
	}

	if(!bool_coordIndex) {
		alert("ERROR: No NODE_COORD_SECTION found.");
		return;
	}

	var startTime = window.performance.now();
	var endTime;

	// Runs search algorithm based on which radio button was checked.
	if(document.getElementById("breadth").checked) {
		var path = breadthFirst(1, 11);	
		endTime = window.performance.now();
		avgBreadth.push(endTime - startTime);
		displayResults(path, getDistance(path), endTime - startTime, avgBreadth);
	}
	else if(document.getElementById("depth").checked) {
		var path = depthFirst(1,11);
		endTime = window.performance.now();
		avgDepth.push(endTime - startTime);
		displayResults(path, getDistance(path), endTime - startTime, avgDepth);
	} else {
		alert("No search algorithm selected.");
	}
}

// Will find shortest number of cities (with number tie breakers)
// But will not necessarily be the shortest path
// as BFS has, by definition, no weighted edges
function breadthFirst(start, end) {
	// Creates queue from external library
	var queue = new Queue();
	queue.enqueue([start]);
	while(queue.length != 0) {

		// Pulls first path from the front of the queue
		var path = queue.dequeue();

		// Checks last node in path to determine end or neighbors
		var node = path[path.length - 1];
		if(node == end) {
			return path;
		}

		// Adds paths with next neighbor in line to end of the queue
		var i;
		for(i = 0; i < graph[node].length; i++) {
			var newPath = JSON.parse(JSON.stringify(path)); // Deep copy instead of shallow copy
			newPath.push(graph[node][i]);
			queue.enqueue(newPath);
		}
	}
}

// Will find the first path via depth-first search.
// Will almost certainly not be smallest number of cities
// Explained in report
function depthFirst(start, end) {

	// Note: variable name is queue, but is not actually looked like a queue
	var queue = [];

	// Initializes array with first node
	queue.unshift([start]);
	var i;
	while(queue.length) {

		// Pulls item off the front of the array
		var path = queue.shift();

		// Pulls off last item in the removed path to check next neighbor and end state
		var node = path[path.length - 1];
		if(node == end) {
			return path;
		}

		if(!graph[node]) {
			// Must have no neighbors
			queue.shift();
			continue;
		}

		var i;
		var newPaths = [];
		// Adds paths with next nodes added to the front of the list.
		for(i = 0; i < graph[node].length; i++) {
			var newPath = JSON.parse(JSON.stringify(path)); // Deep copy instead of shallow copy
			newPath.push(graph[node][i]);
			newPaths.push(newPath);
		}
		// Loop to add elements of newPaths to queue
		for(i = newPaths.length - 1; i >= 0; i--) {
			queue.unshift(newPaths[i]);
		}
	}
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
	
	for(i = 0; i < xCoords.length; i++) {
		var x = parseInt(xCoords[i]);
		var y = parseInt(yCoords[i]);
		ctx.fillRect(x - pointSize/2, y - pointSize/2, pointSize, pointSize);
		ctx.fillText(i + 1, x + 3, y + 3);
	}
	ctx.beginPath();
	ctx.strokeStyle="red";
	ctx.moveTo(xCoords[path[0] - 1], yCoords[path[0] - 1]);
	for(i = 0; i < path.length; i++) {
		ctx.lineTo(xCoords[path[i] - 1], yCoords[path[i] - 1]);
		ctx.stroke();
	}

	// Calculating average time
	var average;
	var sum = 0;
	for(i in averageArray) {
		sum += averageArray[i];
	}
	average = sum/averageArray.length;

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
