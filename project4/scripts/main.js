// Global variables
var xCoords = [];
var yCoords = [];
var runTimes = [];
var population = [];		// Array of all Path objects in a population
var mutationRate = 0.015;	// Default mutation rate
var numGenerations = 1000;	// Default number of generations
var tournamentSize = 0.10;  // Determines percentage of population used to determine parents

// BEGIN OBJECT DEFINITIONS 

function City(x, y, num) {
	this.x = parseFloat(x);
	this.y = parseFloat(y);
	this.num = num;
}

function Path(pathArray) {
	this.path = JSON.parse(JSON.stringify(pathArray));	// Deep copies path into Path object
	this.fitness = getDistance(this.path);
}

// END OBJECT DEFINITIONS

// This function is called by the HTML file.
function main(filePath) {

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
	} else {
		numGenerations = 1000;
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

	population = generatePopulation(cityList);
	findPath(population);

	var endTime = window.performance.now();
}

function findPath(population) {
	var averageArray = [];
	var bestArray = [];
	averageArray.length = 0;
	bestArray.length = 0;
	bestToFront(population);
	for(var i = 1; i <= numGenerations; i++) {
		population = evolve(population);
		averageArray.push({x: i, y: averageFitness(population)});
		bestArray.push({x: i, y: population[0].fitness});
	}
	displayResults(population[0].path, population[0].fitness, null);
	//DEBUG_PrintPath(population[0].path);
	//console.log(getDistance(population[0].path));
	displayLineChart(averageArray, bestArray);

	// Loop to compare fitness and calculated fitness
	for(var i = 0; i < population.length; i++) {
		//console.log(population[i].fitness);
		//console.log(getDistance(population[i].path));
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
	//if(population[0].fitness != getDistance(population[0].path)) {
	//	console.log("NOT EQUAL");
	//	console.log(population[0].fitness + " " + getDistance(population[0].path));
	//}
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

		//var parent1 = population[Math.floor(Math.random() * population.length)];
		//var parent2 = population[Math.floor(Math.random() * population.length)];

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
				//DEBUG_PrintPath(population[i].path);
				//console.log(population[i].fitness);
				newPop[i] = mutate1(newPop[i]);
				//console.log(population[i].fitness);
				//DEBUG_PrintPath(population[i].path);
			} else {
				//DEBUG_PrintPath(population[i].path);
				//DEBUG_PrintFitnesses(population);
				//console.log(population[i].fitness);
				newPop[i] = mutate2(newPop[i]);
				//console.log(population[i].fitness);
				//DEBUG_PrintFitnesses(population);
				//DEBUG_PrintPath(population[i].path);
			}
		}
	}

	// Moves best member of population to front.
	//console.log(averageFitness(newPop));
	bestToFront(newPop);
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

function mutate1(oldPath) {

	var path = JSON.parse(JSON.stringify(oldPath));
	//var path = oldPath;

	var index1 = Math.floor(Math.random() * path.path.length);
	var index2 = Math.floor(Math.random() * path.path.length);

	var temp;

	//DEBUG_PrintPath(path.path);
	
	//console.log(path.path[index1].num + " " + path.path[index2].num);

	temp = path.path[index1];
	path.path[index1] = path.path[index2];
	path.path[index2] = temp;

	//console.log(path.path[index1].num + " " + path.path[index2].num);

	//DEBUG_PrintPath(path.path);

	return new Path(path.path);


	/*var path = JSON.parse(JSON.stringify(population[index]));

	var index1 = Math.floor(Math.random() * path.path.length);
	var index2 = Math.floor(Math.random() * path.path.length);

	var temp;

	//DEBUG_PrintPath(path.path);
	
	//console.log(path.path[index1].num + " " + path.path[index2].num);

	temp = path.path[index1];
	path.path[index1] = path.path[index2];
	path.path[index2] = temp;

	//console.log(path.path[index1].num + " " + path.path[index2].num);

	//DEBUG_PrintPath(path.path);
	
	population[index] = JSON.parse(JSON.stringify(new Path(path)));

	return population;*/
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

function displayLineChart(average, best) {
	var chart = new CanvasJS.Chart("lineChartContainer", {
		zoomEnabled: true,
		animationEnabled: true,
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
	//DEBUG_PrintFitnesses(population);
	var totalFitness = 0;
	for(var i = 0; i < population.length; i++) {
		totalFitness += population[i].fitness;
	}
	//console.log(totalFitness);
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

function sleep(delay) {
	var start = new Date().getTime();
	while (new Date().getTime() < start + delay);
}
