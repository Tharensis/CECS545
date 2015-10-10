// Global variables
var xCoords = [];
var yCoords = [];
var runTimes = [];
var population = [];	// Array of all Path objects in a population
var mutationRate = 0.015

// BEGIN OBJECT DEFINITIONS 

function City(x, y, num) {
	this.x = parseFloat(x);
	this.y = parseFloat(y);
	this.num = num;
}

function Path(pathArray) {
	this.path = JSON.parse(JSON.stringify(pathArray));	// Deep copies path into Path object
	this.fitness = getDistance(pathArray);
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
	var cityList = [];	// Contains the initial list of cities
	cityList.length = 0;

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
		cityList.push(new City(splitLine[1], splitLine[2], splitLine[0]));
	}

	if(!bool_coordIndex) {
		alert("ERROR: No NODE_COORD_SECTION found.");
		return;
	}

	var startTime = window.performance.now();

	//var path = findPath(coordinates);
	population = generatePopulation(cityList);
	findPath(population);

	var endTime = window.performance.now();

	//displayResults(path.path, distance, endTime - startTime, path.added);
}

function findPath(population) {
	bestToFront(population);
	for(var i = 0; i < 100000; i++) {
		//console.log(averageFitness(population));
		population = evolve(population);
		displayResults(population[0].path, population[0].fitness, null);
	}
}

// Moves the best path to the front of the population
function bestToFront(population) {
	var bestIndex = 0;
	var bestFitness = Number.MAX_VALUE;
	for(var i = 0; i < population.length; i++) {
		if(population[i].fitness < bestFitness) {
			bestIndex = i;
			bestFitness = population[i].fitness;
		}
	}
	var newBest = population.splice(bestIndex, 1);
	population.unshift(newBest[0]);
	return population;
}

// Called to produce new population from parents and children
function evolve(population) {
	var newPop = [];
	var parentPopulation = [];

	// Selecting two parents by tournament selection. Random 10% of the population.
	// Execute this by population.length
	// Note: Best member is always added to the new population, so we don't lose it.
	newPop.push(population[0]);
	//console.log(population[0].fitness);
	for(var i = 1; i < population.length; i++) {
		for(var j = 0; j < population.length / 10; j++) {
			parentPopulation.push(population[Math.floor(Math.random() * population.length)]);
		}
		bestToFront(parentPopulation);
		var parent1 = parentPopulation[0];
		parentPopulation.length = 0;
		
		for(var j = 0; j < population.length / 10; j++) {
			parentPopulation.push(population[Math.floor(Math.random() * population.length)]);
		}
		bestToFront(parentPopulation);
		var parent2 = parentPopulation[0];
		parentPopulation.length = 0;

		var child = crossover1(parent1, parent2);
		
		newPop.push(child);
	}
	// Sort the array by fitness. Fitness = path length, so less fit = better.


	// Mutate any member of population based on the mutation rate
	for(var i = 0; i < population.length; i++) {
		if(Math.random() < mutationRate) {
			population[i] = mutate2(population[i]);
		}
	}

	// Moves best member of population to front.
	bestToFront(newPop);
	//console.log(population[0].fitness);
	//console.log(population.length);
	return newPop;
}

// Applies crossover function to two parents and producing one child
function crossover1(parent1, parent2) {

	var childPath = [];

	// Select random interval to cross over and make sure that start < end
	var startIndex = Math.floor(Math.random() * parent1.path.length);
	var endIndex = Math.floor(Math.random() * parent1.path.length);
	if(startIndex > endIndex) {
		var temp = startIndex;
		startIndex = endIndex;
		endIndex = temp;
	}

	// Copy crossover interval from parent 1 into child
	for(var i = startIndex; i <= endIndex; i++) {
		childPath[i] = parent1.path[i];
	}

	// If child doesn't have parent 2's city. Add it.
	for(var i = 0; i < parent2.path.length; i++) {
		// Does child contain parent city? If so, continue;
		var contains = false;
		for(var j = 0; j < parent2.path.length; j++) {
			if(childPath[j] != undefined && childPath[j].num == parent2.path[i].num) {
				contains = true;
				break;
			}
		}
		if(contains) {
			continue;
		}

		// Looping through child to find spare location
		for(var j = 0; j < parent2.path.length; j++) {
			if(childPath[j] == null) {
				childPath[j] = parent2.path[i];
				break;
			}
		}
	}

	return new Path(childPath);
}

function mutate(path) {
	var index1 = Math.floor(Math.random() * path.path.length);
	var index2 = Math.floor(Math.random() * path.path.length);

	var temp;

	//DEBUG_PrintPath(path.path);

	temp = path.path[index1];
	path.path[index1] = path.path[index2];
	path.path[index2] = temp;

	//DEBUG_PrintPath(path.path);

	return path;
}

function mutate2(path) {
	var i = Math.floor(Math.random() * path.path.length);
	var j = Math.floor(Math.random() * path.path.length);
	var temp;

	if(i > j) {
		temp = i;
		i = j;
		j = temp;
	}

	while(i < j) {
		temp = path.path[i];
		path.path[i] = path.path[j];
		path.path[j] = temp;
		i++;
		j--;
	}
	return path;
}

function generatePopulation(cities) {
	var workingSet = [];
	var population = [];

	var max = cities.length;
	for(var i = 0; i < max; i++) {
		while(cities.length) {
			var tempCity = cities.splice(Math.floor(Math.random() * cities.length), 1);
			workingSet.push(tempCity[0]);
		}
		population.push(new Path(workingSet));
		cities = JSON.parse(JSON.stringify(workingSet));
		workingSet.length = 0;
	}
	
	return population;
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
	ctx.lineTo(path[0].x, path[0].y);
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
		if(i != path.length - 2) {
			var point1 = path[i];
			var point2 = path[i + 1];
		} else {
			var point1 = path[i + 1];
			var point2 = path[0];
		}

		var distance = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
		totalDistance += distance;
	}
	return totalDistance;
}

function averageFitness(population) {
	var totalFitness = 0;
	for(var i = 0; i < population.length; i++) {
		totalFitness += population[i].fitness;
	}
	return totalFitness / population.length;
}

// DEBUG FUNCTION ONLY. Outputs the city number array for given path
function DEBUG_PrintPath(path) {
	var newArray = [];
	for(var i = 0; i < path.length; i++) {
		if(path[i] != undefined) {
			newArray.push(path[i].num);
		} else {
			newArray.push(-1);
		}
	}
	console.log(newArray);
}

function sleep(delay) {
	var start = new Date().getTime();
	while (new Date().getTime() < start + delay);
}
