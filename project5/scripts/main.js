// Global variables
var runTimes = [];
var population = [];		// Array of all Path objects in a population
var cityList = [];			// Contains the list of cities
var mutationRate = 0.015;	// Default mutation rate
var numGenerations = -1;	// Default number of generations
var numGenerationsFlag = false;
var tournamentSize = 0.10;  // Determines percentage of population used to determine parents
var averageArray = [];
var bestArray = [];
var population = [];
var startTime;
var startFlag;
var animateFlag = false;
var agreementMatrix = [];
var crowdRatio = 0.15
var wisePath = [];			// Is the aggregate path

var generation = 0;

// BEGIN OBJECT DEFINITIONS 

function City(x, y, num) {
	this.x = parseFloat(x);
	this.y = parseFloat(y);
	this.num = num;
}

function Path(pathArray) {
	this.path = JSON.parse(JSON.stringify(pathArray));	// Deep copies path into Path object
	this.fitness = getDistance(this.path);
	this.adjacency = createAdjacency(this.path);
}

// END OBJECT DEFINITIONS

// This function is called by the HTML file.
function main(filePath) {

	generation = 0;

	// Immediately check if textbox has values and radio buttons selected
	var radios = document.getElementsByClassName("required");
	var numChecked = 0;
	for(var i = 0; i < radios.length; i++) {
		if(radios[i].checked) {
			numChecked++;
		}
	}

	// Updating variables
	var valuePlaceholder;
	if(valuePlaceholder = document.getElementById("generations").value) {
		numGenerations = valuePlaceholder;
		numGenerationsFlag = true;
	} else {
		numGenerationsFlag = false;
	}
	if(valuePlaceholder = document.getElementById("mutationRate").value) {
		mutationRate = valuePlaceholder;
	} else {
		mutationRate = 0.015;
	}
	if(valuePlaceholder = document.getElementById("tournamentSize").value) {
		tournamentSize = valuePlaceholder;
	} else {
		tournamentSize = 0.10;
	}
	if(valuePlaceholder = document.getElementById("expertSize").value) {
		crowdRatio = valuePlaceholder;
	} else {
		crowdRatio = 0.15;
	}

	if(document.getElementById("animateToggle").checked) {
		animateFlag = true;
	} else {
		animateFlag = false;
	}

	if(numChecked == 2) {
		readFile(filePath);
	} else {
		alert("Invalid variables! Select crossover function, mutation function, and generations");
	}
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

	population = generatePopulation(JSON.parse(JSON.stringify(cityList)));

	findPath(population, startTime);
}

function findPath(population, startTime) {

	averageArray.length = 0;
	bestArray.length = 0;
	bestToFront(population);
	// Sets number of generations to 100 * the number of cities if not specified
	if(!numGenerationsFlag) {
		numGenerations = population.length * 100;
	}
	
	// THIS IS WHERE THE TIMEOUTS SHOULD START
	startFlag = setInterval(function(){
		start();
	}, 1);

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
	

	for(var i = 1; i < population.length; i++) {
		for(var j = 0; j < population.length * tournamentSize; j++) {
			parentPopulation.push(population[Math.floor(Math.random() * population.length)]);
		}
		bestToFront(parentPopulation);
		var parent1 = parentPopulation[0];
		parentPopulation.length = 0;
		
		for(var j = 0; j < population.length * tournamentSize; j++) {
			parentPopulation.push(population[Math.floor(Math.random() * population.length)]);
		}
		bestToFront(parentPopulation);
		var parent2 = parentPopulation[0];
		parentPopulation.length = 0;

		if(document.getElementById("cross1").checked) {
			var child = crossover1(parent1, parent2);
		} else {
			var child = crossover2(parent1, parent2);
		}
		
		newPop.push(child);
	}

	// Mutate any member of population based on the mutation rate
	for(var i = 0; i < population.length; i++) {
		if(Math.random() < mutationRate) {
			if(document.getElementById("mutate1").checked) {
				newPop[i] = mutate1(newPop[i]);
			} else {
				newPop[i] = mutate2(newPop[i]);
			}
		}
	}

	// Sort array so we can get a proper wisdom of crowds
	newPop.sort(function(a, b){return a.fitness - b.fitness;});

	wisePath = wisdom(newPop);

	// Kill off a random individual in the bottom 40% by replacing it with the "wise" one
	// Pick a number between 0.6n and n where n is the number of members of the population
	var victim = newPop.length - Math.floor(Math.random() * newPop.length * .4) - 1;
	newPop.splice(victim, 1);	// Member is now dead
	newPop.push(wisePath);
	
	newPop.sort(function(a, b){return a.fitness - b.fitness;});

	return newPop;
}

function wisdom(population) {
	// Build the agreement matrix from all members of the population
	// Sum up all adjacency matrices
	
	// Deep copy first member's matrix, so we don't need to create a new 2D matrix
	agreementMatrix = JSON.parse(JSON.stringify(population[0].adjacency));

	for(var i = 1; i < population.length * crowdRatio; i++) {

		for(var y = 0; y < agreementMatrix.length; y++) {
			for(var x = 0; x < agreementMatrix.length; x++) {
				agreementMatrix[y][x] += population[i].adjacency[y][x];
			}
		}

	}

	// Calculating the aggregate path with the following process
	// 1) Start at a random row in the matrix
	// 2) Look at the city with the max number of agreements
	// 		a) If city has not yet been added to the aggregate path, add it
	// 		b) If city already added, check the next best city
	// 3) Move to the row in the matrix corresponding to the next city
	
	var aggregatePath = [];
	var addedCities = [];
	var bestItems = [];		// Best possible "next cities" for any given city. Resets every row of the matrix
	var maxAgreements = 0;
	
	var y = Math.floor(Math.random() * agreementMatrix.length); 	// Starts y at a random value
	addedCities.length = 0;
	while(aggregatePath.length < agreementMatrix.length) {
		bestItems.length = 0;
		for(var x = 0; x < agreementMatrix.length; x++) {
			bestItems.push({city:x, agreements:agreementMatrix[y][x]});
		}
		bestItems.sort(function(a, b){return b.agreements - a.agreements;});
		while(true) {
			if(addedCities.indexOf(bestItems[0].city) == -1) {
				// Add item to path
				aggregatePath.push(cityList[bestItems[0].city]);
				addedCities.push(bestItems[0].city);
				y = bestItems[0].city;
				break;
			} else {
				// Essentially skip to the next item
				bestItems.shift();
			}
		}
	}

	return new Path(aggregatePath);
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

// Crossover 2 moves random city locations from parent 1 to offspring, then fills in the rest from parent 2 in order
function crossover2(parent1, parent2) {
	var childPath = [];

	// Copy crossover interval from parent 1 into child
	for(var i = 0; i <= parent1.path.length; i++) {
		if(Math.random() < 0.4) {
			childPath[i] = parent1.path[i];
		}
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
	
	childPath.length = parent1.path.length; // Not sure why I need this currently, but oh well.

	return new Path(childPath);
}

function mutate1(oldPath) {

	var path = JSON.parse(JSON.stringify(oldPath));
	//var path = oldPath;

	var index1 = Math.floor(Math.random() * path.path.length);
	var index2 = Math.floor(Math.random() * path.path.length);

	var temp;

	temp = path.path[index1];
	path.path[index1] = path.path[index2];
	path.path[index2] = temp;

	return new Path(path.path);
}

function mutate2(oldPath) {

	var path = JSON.parse(JSON.stringify(oldPath));

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
	
	path = new Path(path.path);

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

	var yOffset = 15;

	var canvas = document.getElementById("resultCanvas");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "black";
	ctx.scale(canvasScale, canvasScale);
	ctx.font = "3px Arial";

	
	
	// Draw lines
	ctx.beginPath();
	ctx.strokeStyle="red";
	ctx.lineWidth = 1;
		
	ctx.moveTo(path[0].x, path[0].y + yOffset);
	for(i = 1; i < path.length; i++) {
		ctx.lineTo(path[i].x, path[i].y + yOffset);
	}
	ctx.lineTo(path[0].x, path[0].y + yOffset);
	ctx.stroke();

	// Draw points
	for(i = 0; i < path.length; i++) {
		var point = path[i];
		var x = point.x;
		var y = point.y + yOffset;

		ctx.fillRect(x - pointSize/2, y - pointSize/2, pointSize, pointSize);
		ctx.fillText(point.num, x + pointSize, y + pointSize);
	}

	// Calculating average time
	runTimes.push(time);
	var average;
	var sum = 0;
	for(i = 0; i < runTimes.length; i++) {
		sum += runTimes[i];
	}
	average = sum / runTimes.length;

	ctx.fillStyle = "#000000";
	ctx.fillText("Distance: " + distance, 5, 5);
	ctx.fillText("Time: " + time/1000 + "s", 5, 8);
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

// Displays results on an HTML5 canvas
// For some reason, Javascript wasn't drawing on both canvases when
// in one function, so I spread it out. Bah.
function displayAggregate(population, wisePath) {
	var i;
	var textOffset = 3;
	var pointSize = 2;
	var canvasScale = 4;
	var path = population[0].path;

	var yOffset = 15;

	var canvas = document.getElementById("aggregateCanvas");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "black";
	ctx.scale(canvasScale, canvasScale);
	ctx.font = "3px Arial";

	// Draw points
	for(i = 0; i < path.length; i++) {
		var point = path[i];
		var x = point.x;
		var y = point.y + yOffset;

		ctx.fillRect(x - pointSize/2, y - pointSize/2, pointSize, pointSize);
		ctx.fillText(point.num, x + pointSize, y + pointSize);
	}
	
	// Draw lines
	ctx.beginPath();
	ctx.strokeStyle="red";
	ctx.lineWidth = 1;
		
	for(var j = 0; j < population.length; j++) {
		path = population[j].path;
		ctx.moveTo(path[0].x, path[0].y + yOffset);
		for(i = 1; i < path.length; i++) {
			ctx.lineTo(path[i].x, path[i].y + yOffset);
		}
		ctx.lineTo(path[0].x, path[0].y + yOffset);
		ctx.stroke();
	}

	ctx.beginPath();
	ctx.strokeStyle="chartreuse";
	ctx.moveTo(wisePath.path[0].x, wisePath.path[0].y + yOffset);
	for(i = 1; i < path.length; i++) {
		ctx.lineTo(wisePath.path[i].x, wisePath.path[i].y + yOffset);
	}
	ctx.lineTo(wisePath.path[0].x, wisePath.path[0].y + yOffset);
	ctx.stroke();
	 
	// Draw points
	for(i = 0; i < path.length; i++) {
		var point = path[i];
		var x = point.x;
		var y = point.y + yOffset;

		ctx.fillRect(x - pointSize/2, y - pointSize/2, pointSize, pointSize);
		ctx.fillText(point.num, x + pointSize, y + pointSize);
	}

	ctx.scale(1 / canvasScale, 1 / canvasScale);
}

function start() {

	if(generation == 0) {
		startTime = window.performance.now();
	}

	population = evolve(population);
	averageArray.push({x: generation, y: averageFitness(population)});
	bestArray.push({x: generation, y: population[0].fitness});
	endTime = window.performance.now();

	if(generation >= numGenerations) {
		clearTimeout(startFlag);
		displayResults(population[0].path, population[0].fitness, endTime - startTime);	
		displayAggregate(population, wisePath);	
		displayLineChart(averageArray, bestArray);
		var tempString = "";
		for(var i = 0; i < population[0].path.length; i++) {
			if(i != population[0].path.length - 1) {
				tempString += population[0].path[i].num + ",";
			} else {
				tempString += population[0].path[i].num;
			}
		}
		console.log(tempString);
		console.log(population[0].fitness);
		console.log((endTime - startTime)/1000);
		return;
	}

	if(animateFlag) {
		displayResults(population[0].path, population[0].fitness, endTime - startTime);	
		displayAggregate(population, wisePath);	
		displayLineChart(averageArray, bestArray);
	}

	generation++;
}

function displayLineChart(average, best) {
	var chart = new CanvasJS.Chart("lineChartContainer", {
		zoomEnabled: true,
		animationEnabled: false,
		title:{
			text: "Average distance and Best distance"
		},
		axisX: {
			labelAngle: -30
		},
		axisY: {
			includeZero: true
		},
		data: [
		{
			type: "line",
			showInLegend: true,
			lineThickness: 2,
			name: "Best Distance",
			dataPoints: best
		},
		{
			type: "line",
			showInLegend: true,
			lineThickness: 2,
			name: "Average Distance",
			dataPoints: average
		}
		]
	});
	chart.render();
}

function getDistance(path) {
	var totalDistance = 0;

	for(i = 0; i < path.length; i++) {
		if(i != path.length - 1) {
			var point1 = path[i];
			var point2 = path[i + 1];
		} else {
			var point1 = path[i];
			var point2 = path[0];
		}

		var distance = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
		totalDistance += distance;
	}
	return totalDistance;
}

function createAdjacency(path) {
	var matrix = [];
	// Initialize the 2D matrix
	for(var i = 0; i < path.length; i++) {
		matrix[i] = [];
		for(var j = 0; j < path.length; j++) {
			matrix[i].push(0);
		}
	}

	for(var i = 0; i < path.length; i++) {
		if(i != path.length - 1) {
			var city1 = path[i].num - 1;
			var city2 = path[i + 1].num - 1;
		} else {
			var city1 = path[i].num - 1;
			var city2 = path[0].num - 1;
		}
		matrix[city1][city2] = 1;
		matrix[city2][city1] = 1;
	}
	return matrix;
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

function DEBUG_PrintFitnesses(population) {
	var newArray = [];
	for(var i = 0; i < population.length; i++) {
		newArray.push(population[i].fitness);
	}
	console.log(newArray);
}

function DEBUG_PrintAdjacency(matrix) {
	var line = "";
	for(var i = 0; i < matrix.length; i++) {
		for(var j = 0; j < matrix.length; j++) {
			line += matrix[i][j] + " ";
		}
		console.log(line);
		line = "";
	}
	console.log(" ");
}

function sleep(delay) {
	var start = new Date().getTime();
	while (new Date().getTime() < start + delay);
}
