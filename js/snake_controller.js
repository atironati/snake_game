var SnakeController = function( wrld, snek ) {
  this.world = wrld;
  this.snake = snek;

  this.findPath = function(world, pathStart, pathEnd) {
    // shortcuts for speed
	var	abs = Math.abs;
	var	max = Math.max;
	var	pow = Math.pow;
	var	sqrt = Math.sqrt;

	// the world data are integers:
	// anything higher than this number is considered blocked
	// this is handy is you use numbered sprites, more than one
	// of which is walkable road, grass, mud, etc
	var walkableTiles = ["empty-square"];

	// keep track of the world dimensions
	// Note that this A-star implementation expects the world array to be square: 
	// it must have equal height and width. If your game world is rectangular, 
	// just fill the array with dummy values to pad the empty space.
	var worldWidth = this.world[0].length;
	var worldHeight = this.world.length;
	var worldSize =	worldWidth * worldHeight;

	// which heuristic should we use?
	// default: no diagonals (Manhattan)
	var distanceFunction = ManhattanDistance;
	var findNeighbours = function(){}; // empty

	distanceFunction("a", "b");

	/*
	  // alternate heuristics, depending on your game:
	  // diagonals allowed but no sqeezing through cracks:
	  var distanceFunction = DiagonalDistance;
	  var findNeighbours = DiagonalNeighbours; diagonals and squeezing through cracks allowed:
	  var distanceFunction = DiagonalDistance;
	  var findNeighbours = DiagonalNeighboursFree;
	  // euclidean but no squeezing through cracks:
	  var distanceFunction = EuclideanDistance;
	  var findNeighbours = DiagonalNeighbours;
	  // euclidean and squeezing through cracks allowed:
	  var distanceFunction = EuclideanDistance;
	  var findNeighbours = DiagonalNeighboursFree;
	*/



}

  // distanceFunction functions
  // these return how far away a point is to another

  function ManhattanDistance(Point, Goal) {
  	// linear movement - no diagonals - just cardinal directions (NSEW)
		return abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
  }

  function DiagonalDistance(Point, Goal) {
    // diagonal movement - assumes diag dist is 1, same as cardinals
	return max(abs(Point.x - Goal.x), abs(Point.y - Goal.y));
  }

  function EuclideanDistance(Point, Goal) {
    // diagonals are considered a little farther than cardinal directions
    // diagonal movement using Euclide (AC = sqrt(AB^2 + BC^2))
    // where AB = x2 - x1 and BC = y2 - y1 and AC will be [x3, y3]
    return sqrt(pow(Point.x - Goal.x, 2) + pow(Point.y - Goal.y, 2));
  }

  // Neighbours functions, used by findNeighbours function
  // to locate adjacent available cells that aren't blocked
  // Returns every available North, South, East or West
  // cell that is empty. No diagonals,
  // unless distanceFunction function is not Manhattan
  function Neighbours(x, y)
  {
      var N = y - 1,
          S = y + 1,
          E = x + 1,
          W = x - 1,
      myN = N > -1 && canWalkHere(x, N),
      myS = S < worldHeight && canWalkHere(x, S),
      myE = E < worldWidth && canWalkHere(E, y),
      myW = W > -1 && canWalkHere(W, y),
      result = [];
     if(myN)
      result.push({x:x, y:N});
      if(myE)
      result.push({x:E, y:y});
      if(myS)
      result.push({x:x, y:S});
      if(myW)
      result.push({x:W, y:y});
      findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
      return result;
  }
  // returns every available North East, South East,
  // South West or North West cell - no squeezing through
  // "cracks" between two diagonals
  function DiagonalNeighbours(myN, myS, myE, myW, N, S, E, W, result)
  {
     if(myN)
      {
          if(myE && canWalkHere(E, N))
          result.push({x:E, y:N});
          if(myW && canWalkHere(W, N))
          result.push({x:W, y:N});
      }
      if(myS)
      {
          if(myE && canWalkHere(E, S))
          result.push({x:E, y:S});
          if(myW && canWalkHere(W, S))
          result.push({x:W, y:S});
      }
    }
    // returns boolean value (world cell is available and open)
    function canWalkHere(x, y)
    {
        return ((world[x] != null) &&
            (world[x][y] != null) &&
            (walkableTiles.includes(world[x][y][0].className));
    };
}

