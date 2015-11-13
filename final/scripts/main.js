var puzzle;
var population = []; // Array of "Solution"s in the population. May or may not be valid
var populationSize = 100;

// BEGIN OBJECT DEFINITIONS

// Solution object will consist of a matrix of 1s and 0s where a 1 is a black square
function Solution(map) {
	this.map = JSON.parse(JSON.stringify(map));
	this.fitness = getFitness(this);
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
	displayResults(puzzle, population[population.length - 1]);

	//findPath(population, startTime);
}

// Randomly generates an initial population
function generatePopulation() {
	var blackProbability = (puzzle.x * puzzle.y) / (puzzle.count / 10);
	var newGen = [];

	for(var i = 0; i < populationSize; i++) {
		for(var y = 0; y < puzzle.y; y++) {
			newGen.push([]);
			for(var x = 0; x < puzzle.x; x++) {
				if(puzzle.map[y][x] == "0") {
					if(Math.random() < (blackProbability / (puzzle.x * puzzle.y))) {
						newGen[y].push(1);
					} else {
						newGen[y].push(0);
					}
				} else {
					newGen[y].push(0);
				}
			}
		}
		population.push(new Solution(newGen));
	}
}

function displayResults(puzzle, solution) {

	// TODO remove default solution
	/*solution = [
		[0,	0,	0,	0,	0,	0,	0,	0,	0],
		[1,	0,	0,	0,	0,	1,	0,	1,	0],
		[0,	0,	1,	0,	1,	0,	0,	0,	0],
		[0,	1,	0,	0,	0,	0,	0,	0,	1],
		[0,	0,	0,	0,	1,	0,	1,	0,	0],
		[0,	1,	0,	0,	0,	0,	0,	0,	0],
		[1,	0,	0,	1,	0,	0,	1,	0,	0],
		[0,	0,	0,	0,	0,	0,	0,	0,	1],
		[0,	0,	0,	0,	1,	0,	0,	0,	0]
	];*/

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
	for(var y = 0; y < puzzle.y; y++) {
		for(var x = 0; x < puzzle.x; x++) {
			if(solution.map[y][x]) {
				ctx.fillRect(x * 50, y * 50, 50, 50);
			}
		}
	}
}

function getFitness(solution) {
	return 0;
}
