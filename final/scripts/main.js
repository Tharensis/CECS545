// CONSTANTS
var populationSize = 5000;
var tournamentSize = .01;
// END CONSTANTS

var puzzle;
var population = []; // Array of "Solution"s in the population. May or may not be valid
var running;	// Flag used for starting and stopping the interval

// BEGIN OBJECT DEFINITIONS

// Solution object will consist of a matrix of 1s and 0s where a 1 is a black square
function Solution(locations) {
	this.locations = JSON.parse(JSON.stringify(locations));
	this.fitness = getFitness(this);
}

function Point(x, y) {
	this.x = x;
	this.y = y;
}

// END OBJECT DEFINITIONS


function main(filePath) {
	// TODO potentially add more stuff to do after hitting the button, like options

	readFile(filePath);
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
	var temp = [];

	// Stores input file into the "puzzle" object.
	for(i = 0; i < splitFile.length - 1; i++) {
		var splitLine = splitFile[i].split("\t");
		temp.push(splitLine);
	}

	// Defining the object that will hold the puzzle
	puzzle = {
		map: temp,
		x: temp[0].length,
		y: temp.length,
		count: 0
	};

	// Loop to find amount of "numbered" squares
	for(var y = 0; y < puzzle.y; y++) {
		for(var x = 0; x < puzzle.x; x++) {
			if(puzzle.map[y][x] != 0) {
				puzzle.count++;
			}
		}
	}


	generatePopulation();

	running = setInterval(function(){
		solve();
	}, 1);
}

function solve() {
	
	evolve();
	displayResults(puzzle, population[population.length - 1]);
	DEBUG_PrintAverageFitness();
}

function evolve() {
	crossover();
	population.sort(function(a,b){return a.fitness - b.fitness;});
	// Crossover
	// Mutate
}

// Does tournament selection and chooses random crossover
function crossover() {
	// Tournament select
	// 1) Create (1 / tournamentSize) arrays by removing items from population
	// 2) Sort arrays
	// 3) Push the best one back into the population.
	
	var tournaments = [];
	var max = population.length;
	for(var i = 0; i < (1 / tournamentSize); i++) {
		tournaments.push([]);
		for(var j = 0; j < max * tournamentSize; j++) {
			var temp = population.splice(Math.floor(Math.random() * population.length), 1);
			tournaments[i].push(temp[0]);
			temp.length = 0;
		}
	}

	for(var i = 0; i < tournaments.length; i++) {
		tournaments[i].sort(function(a,b) {return a.fitness - b.fitness;});
		population.push(tournaments[i][0]);
	}


	// Pick random crossover function
	
	var parentSelections = (populationSize - tournaments.length) / 2;
	var choice;
	var parent1;
	var parent2;
	var child1 = [];
	var child2 = [];
	for(var i = 0; i < parentSelections; i++) {
		parent1 = population[Math.floor(Math.random() * tournaments.length)];
		parent2 = population[Math.floor(Math.random() * tournaments.length)];
		child1.length = 0;
		child2.length = 0;

		choice = Math.floor(Math.random() * 2) + 1;

		switch(choice) {
			case 1:
				// Crossover 1
				// 		Create two children by giving the left side of one parent and the right side of another parent
				
				// Sort two parents by x so we can distinguish left and right side
				parent1.locations.sort(function(a,b){return a.x - b.x;});
				parent2.locations.sort(function(a,b){return a.x - b.x;});

				// Give left side (rounded down) of parent1 to child1
				//	left side (rounded down) of parent2 to child1
				//	Do the opposite for child2

				for(var j = 0; j < Math.max(parent1.locations.length, parent2.locations.length); j++) {
					if(parent1.locations[j]) { // Checking if defined
						if(parent1.locations[j].x < Math.floor(puzzle.x / 2)) {
							child1.push(parent1.locations[j]);
						} else {
							child2.push(parent1.locations[j]);
						}
					}
					if(parent2.locations[j]) { // Checking if defined
						if(parent2.locations[j].x < Math.floor(puzzle.x / 2)) {
							child2.push(parent2.locations[j]);
						} else {
							child1.push(parent2.locations[j]);
						}
					}
				}

				population.push(new Solution(child1));
				population.push(new Solution(child2));
				break;

			case 2:
				// Crossover 2
				// 		Create two children by giving the top of one parent and the bottom of another parent

				// Sort two parents by y so we can distinguish top and bottom
				parent1.locations.sort(function(a,b){return a.y - b.y;});
				parent2.locations.sort(function(a,b){return a.y - b.y;});

				// Give top (rounded down) of parent1 to child1
				//	bottom (rounded down) of parent2 to child1
				//	Do the opposite for child2

				for(var j = 0; j < Math.max(parent1.locations.length, parent2.locations.length); j++) {
					if(parent1.locations[j]) { // Checking if defined
						if(parent1.locations[j].y < Math.floor(puzzle.y / 2)) {
							child1.push(parent1.locations[j]);
						} else {
							child2.push(parent1.locations[j]);
						}
					}
					if(parent2.locations[j]) { // Checking if defined
						if(parent2.locations[j].y < Math.floor(puzzle.y / 2)) {
							child2.push(parent2.locations[j]);
						} else {
							child1.push(parent2.locations[j]);
						}
					}
				}

				population.push(new Solution(child1));
				population.push(new Solution(child2));
				break;
			default:
				console.log("WE GOT NOTHING");
		}
	}
}

function mutate() {

}

// Randomly generates an initial population
function generatePopulation() {
	var newGen = [];
	var tempX;
	var tempY;

	var hasPoint = false;

	for(var i = 0; i < populationSize; i++) {
		newGen.length = 0;
		for(var j = 0; j < puzzle.count / 1; j++) {
			hasPoint = false;
			tempX = Math.floor(Math.random() * puzzle.x);
			tempY = Math.floor(Math.random() * puzzle.y);

			if(puzzle.map[tempY][tempX] == "0") {

				// Check if current solution already has this point
				for(var k = 0; k < newGen.length; k++) {
					// If not, add it
					if(newGen[k].x == tempX && newGen[k].y == tempY) {
						hasPoint = true;
					}
				}
				if(!hasPoint) {
					newGen.push(new Point(tempX, tempY));
				}
			}
		}
		population.push(new Solution(newGen));
	}
}

function displayResults(puzzle, solution) {

	var canvas = document.getElementById("resultCanvas");
	var ctx = canvas.getContext("2d");
	
	// Set canvas dimensions based on puzzle size
	// Note: Original size assumes 9x9
	ctx.canvas.width = puzzle.x * 50;
	ctx.canvas.height = puzzle.y * 50;

	// Blank the canvas
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "black";
	ctx.font = "15px Arial";

	// Draw the puzzle grid
	ctx.strokeStyle="black";
	ctx.lineWidth = 1;
	for(var lineOffset = 50; lineOffset < Math.max(ctx.canvas.width, ctx.canvas.height); lineOffset += 50) {
		// Draw a vertical line
		if(lineOffset < ctx.canvas.width) {
			ctx.beginPath();
			ctx.moveTo(lineOffset, 0);
			ctx.lineTo(lineOffset, ctx.canvas.height);
			ctx.stroke();
		}
		// Draw a horizontal line
		if(lineOffset < ctx.canvas.height) {
			ctx.beginPath();
			ctx.moveTo(0, lineOffset);
			ctx.lineTo(ctx.canvas.width, lineOffset);
			ctx.stroke();
		}
	}

	// Draw the puzzle circles
	ctx.textBaseline="middle";
	ctx.textAlign="center";
	ctx.lineWidth = 2;
	var xCoord;
	var yCoord;
	for(var y = 0; y < puzzle.y; y++) {
		for(var x = 0; x < puzzle.x; x++) {
			if(puzzle.map[y][x] != "0") {
				xCoord = 25 + x * 50;
				yCoord = 25 + y * 50;
				ctx.beginPath();
				ctx.arc(xCoord, yCoord, 22, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.fillText(puzzle.map[y][x], xCoord, yCoord);
			}
		}
	}
	
	// Draw current solution
	var xIndex = 0;
	var yIndex = 0;
	for(var i = 0; i < solution.locations.length; i++) {
		xIndex = solution.locations[i].x;
		yIndex = solution.locations[i].y;
		ctx.fillRect(xIndex * 50, yIndex * 50, 50, 50);
	}
}

function getFitness(solution) {
	var fitness = 0;
	var seen = 0;

	// To grade the fitness, we check the number of squares that each numbered
	// square is supposed to see versus how many it actually sees.
	
	for(var y = 0; y < puzzle.y; y++) {
		for(var x = 0; x < puzzle.x; x++) {
			if(puzzle.map[y][x] != "0") {
				seen = checkSeen(x, y, solution.locations);
				fitness += Math.abs(seen - parseInt(puzzle.map[y][x]));
			}
		}
	}

	// Create half-assed matrix of solution just to check for adjacent
	var tempArray = [];
	solution.locations.sort(function(a,b){return b.y - a.y;});
	// Creating 2D array to hold the half-assed matrix
	for(var i = 0; i < puzzle.y; i++) {
		tempArray.push([]);
	}
	// Half-assed matrix filled
	for(var i = 0; i < solution.locations.length; i++) {
		tempArray[solution.locations[i].y][solution.locations[i].x] = 1;
	}

	// Searching half-assed array to find adjacent black squares
	for(var y = 0; y < puzzle.y; y++) {
		for(var x = 0; x < puzzle.x; x++) {
			if(tempArray[y][x] == 1) {
				if(tempArray[y][x - 1] == 1) {
					fitness += 1;
				}
				if(tempArray[y][x + 1] == 1) {
					fitness += 1;
				}
				// Need to check if the y dimension is undefined...
				if(y != 0) {
					if(tempArray[y - 1][x] == 1) {
						fitness += 1;
					}
				}
				if(y != puzzle.y - 1) {
					if(tempArray[y + 1][x] == 1) {
						fitness += 1;
					}
				}
			}
		}
	}

	return fitness;
}

// Returns the number of white squares a given numbered-square can see
function checkSeen(x, y, solution) {
	// 1) Check the nearest black square to the left and right of the numbered square
	// 2) Check the nearest black square to the top and bottom of the numbered square
	
	var nearestLeft = -1;
	var nearestRight = puzzle.x;
	var nearestTop = -1;
	var nearestBottom = puzzle.y;

	for(var i = 0; i < solution.length; i++) {
		// Checking nearest x squares
		if(solution[i].y == y && solution[i].x < x) {
			if(solution[i].x > nearestLeft) {
				nearestLeft = solution[i].x;
			}
		}
		if(solution[i].y == y && solution[i].x > x) {
			if(solution[i].x < nearestRight) {
				nearestRight = solution[i].x;
			}
		}

		// Checking nearest y squares
		if(solution[i].x == x && solution[i].y < y) {
			if(solution[i].y > nearestTop) {
				nearestTop = solution[i].y;
			}
		}
		if(solution[i].x == x && solution[i].y > y) {
			if(solution[i].y < nearestBottom) {
				nearestBottom = solution[i].y;
			}
		}
	}
	return (nearestRight - nearestLeft) + (nearestBottom - nearestTop) - 3;
}

function DEBUG_PrintAverageFitness() {
	var average = 0;
	for(var i = 0; i < population.length; i++) {
		average += population[i].fitness;
	}
	console.log(average / population.length);
}

function DEBUG_PrintPointArray(array) {
	var output = "";
	for(var i = 0; i < array.length; i++) {
		output = output + "(" + array[i].x + "," + array[i].y + ") ";
	}
	console.log(output);
}
