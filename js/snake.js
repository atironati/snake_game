$(function(){

  var Snake = function( gw, initial_head_pos, color, name, snake_control, highlight_path ) {
    this.body = new Array(3);
    for (var i=0; i < 3; i++){
      this.body[i] = new Array(2);
    }
    this.gameWorld = gw;
    this.grid = this.gameWorld.grid;
    this.snakeController = snake_control;
    this.highlightPath = highlight_path;
    this.color = color;
    this.headColor = color + "-head";
    this.name = name;
    
    this.direction = [0, -1];
    this.foodEatenCount = 0;
    this.drawBody(initial_head_pos);
  };

  $.extend( Snake.prototype, {
    drawBody: function(initial_head_pos) {
      this.grid[initial_head_pos.x][initial_head_pos.y][0].className = "snake-head-square " + this.headColor;
      this.body[0] = initial_head_pos;
      this.grid[initial_head_pos.x][initial_head_pos.y+1][0].className = "snake-square " + this.color;
      this.body[1] = new Point(initial_head_pos.x,initial_head_pos.y+1);
      this.grid[initial_head_pos.x][initial_head_pos.y+2][0].className = "snake-square " + this.color;
      this.body[2] = new Point(initial_head_pos.x,initial_head_pos.y+2);
    },
    setDirection: function( dir ) {
      var head = this.body[0];
      var next = this.grid[head.x + dir[0]][head.y+ dir[1]];
      if (!next[0].className.split(" ").includes("snake-square")) { // TODO: do I really need this logic? something to do with button pressed?
        this.direction = dir;
        return true;
      }

      return false;
    },
    runSnakeController: function(food) {
      var path = this.snakeController.findPath(this.body[0], food);

      if (this.highlightPath) {
        this.gameWorld.highlightPath(this, path);
      }

      var nextSquare;
      var newDirection;

      // If the snake can't find a path to the food, keep going in a safe direction if possible
      if (path.length == 0) {
        newDirection = this.safestDirection();
      } else {
        nextSquare = path[1];
        newDirection = [nextSquare[0] - this.body[0].x, nextSquare[1] - this.body[0].y];
      }

      this.setDirection(newDirection);
      this.move();
    },
    move: function() {
      var head_pos = this.body[0];
      var tail_pos = this.body.pop();
      var new_head_pos_x = head_pos.x + this.direction[0];
      var new_head_pos_y = head_pos.y + this.direction[1];
      var new_head_pos = new Point(new_head_pos_x,new_head_pos_y);

      // remove tail
      this.grid[tail_pos.x][tail_pos.y][0].className = "empty-square";

      // set old head to regular body part
      this.grid[head_pos.x][head_pos.y][0].className = "snake-square " + this.color;

      if(this.worldEndingDeathCheck(new_head_pos)) return;

      // draw the head in its new position
      this.grid[new_head_pos.x][new_head_pos.y][0].className = "snake-head-square " + this.headColor;
      this.body.unshift(new_head_pos);

      // is the snake about to eat food?
      if (new_head_pos.equals(this.gameWorld.food)) {
        this.foodEatenCount++;
        this.body.push(tail_pos); // grow
        this.gameWorld.resetFood();
      }
    },
    nextHeadPosition: function() {
      var head_pos = this.body[0];
      var new_head_pos_x = head_pos.x + this.direction[0];
      var new_head_pos_y = head_pos.y + this.direction[1];
      return new Point(new_head_pos_x,new_head_pos_y);
    },
    nextHeadPositionWithDirection: function(dir) {
      var head_pos = this.body[0];
      var new_head_pos_x = head_pos.x + dir[0];
      var new_head_pos_y = head_pos.y + dir[1];
      return new Point(new_head_pos_x,new_head_pos_y);
    },
    worldEndingDeathCheck: function(new_head_pos) {
      if (this.deathCheck(new_head_pos)) {
        this.gameWorld.endGame();
        return true;
      } else {
        return false;
      }
    },
    deathCheck: function(new_head_pos) {
      // is the snake about to go off the grid?
      if ((new_head_pos.x < 0 || new_head_pos.x >= this.grid.length) ||
          (new_head_pos.y < 0 || new_head_pos.y >= this.grid[0].length)) {
        return true;
      }

      var new_head_pos_classes = this.grid[new_head_pos.x][new_head_pos.y][0].className.split(" ");

      // is the snake about to eat itself?
      if (new_head_pos_classes.includes("snake-square")) {
        return true;
      }
      // is the snake about to eat the head of another snake?
      if (new_head_pos_classes.includes("snake-head-square")) {
        return true;
      }

      return false;
    },
    safestDirection: function() {
      var returnDir = this.direction;
      var possibleDirections = [[-1,0],
                                [0,-1],
                                [1,0],
                                [0,1]];
      var that = this;

      // If we aren't going to die next turn, keep going that way, otherwise choose a new direction
      if(this.deathCheck(this.nextHeadPosition())) {
        var maybeSafeDir = possibleDirections.forEach(function(possibleDir) {
          var possibleNextHeadPosition = that.nextHeadPositionWithDirection(possibleDir);
          if (!that.deathCheck(possibleNextHeadPosition)) {
            returnDir = possibleDir;
          }
        })

        return returnDir;
      } else {
        return returnDir;
      }
    },
    foodCheck: function ( food ) {
      var head_pos = this.body[0];

      return (head_pos.equals(food));
    }
  });

  window.App = window.App || {};
  window.App.Snake = Snake;
});
