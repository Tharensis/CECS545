// Global variables
var xCoords = [];
var yCoords = [];
var distanceTable = [];
var paths = [1];

// Directed graph containing
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
	breadthFirst(1, 11);	
}

// Will find shortest number of cities (with number tie breakers)
// But will not necessarily be the shortest path
// As BFS has, by definition, no weighted edges
function breadthFirst(start, end) {
	var queue = new Queue();
	queue.enqueue([start]);
	while(queue.length != 0) {
		var path = queue.dequeue();
		var node = path[path.length - 1];
		if(node == end) {
			return path;
		}
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
	var queue = [];
	queue.push([start]);
	var i;
	while(queue.length) {
		var path = queue.shift();
		console.log("Path: ");
		console.log(path);
		var node = path[path.length - 1];
		console.log("Node: ");
		console.log(node);
		if(node == end) {
			console.log("Returning path: " + path);
			return path;
		}
		console.log("Adjacent list: " + graph[node]);

		if(!graph[node]) {
			// Must have no neighbors
			console.log("No neighbors");
			queue.shift();
			continue;
		}

		var i;
		var newPaths = [];
		// Adds paths with next nodes added to the front of the list.
		for(i = 0; i < graph[node].length; i++) {
			console.log("Adjacent" + graph[node][i]);
			var newPath = JSON.parse(JSON.stringify(path)); // Deep copy instead of shallow copy
			newPath.push(graph[node][i]);
			newPaths.push(newPath);
			console.log("Working newPaths set: " + newPaths);
		}
		// Loop to add elements of newPaths to queue
		for(i = newPaths.length - 1; i >= 0; i--) {
			queue.unshift(newPaths[i]);
		}
		console.log("New Queue: " + queue);
	}
}

// Adds a row to the result table
function displayResult(path, distance, time) {
	// Loop to fix city indexes
	for(i in path) {
		path[i] += 1;
	}
	
	var table = document.getElementById("resultTable");
	var row = table.insertRow();
	var cell1 = row.insertCell(0);
	var cell2 = row.insertCell(1);
	var cell3 = row.insertCell(2);
	var cell4 = row.insertCell(3);

	cell1.innerHTML = path.length - 1;
	cell2.innerHTML = path;
	cell3.innerHTML = distance;
	cell4.innerHTML = time/1000 + "s";
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
