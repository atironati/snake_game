$(function(){

  var Snake = function( gw ) {
    this.body = new Array(3);
    for (var i=0; i < 3; i++){
      this.body[i] = new Array(2);
    }
    this.gameWorld = gw;
    this.grid = this.gameWorld.grid;
    
    this.direction = [0, -1];
    this.foodEatenCount = 0;
    this.setup();
  };

  $.extend( Snake.prototype, {
    setup: function() {
      head_pos = Math.round(this.gameWorld.boardSize / 2);

      this.grid[head_pos][head_pos][0].className = "snake-head-square";
      this.body[0] = new Point(head_pos,head_pos);
      this.grid[head_pos][head_pos+1][0].className = "snake-square";
      this.body[1] = new Point(head_pos,head_pos+1);
      this.grid[head_pos][head_pos+2][0].className = "snake-square";
      this.body[2] = new Point(head_pos,head_pos+2);
    },
    setDirection: function( dir ) {
      var head = this.body[0];
      var next = this.grid[head.x + dir[0]][head.y+ dir[1]];
      if (next[0].className != "snake-square") {
        this.direction = dir;
        return true;
      }

      return false;
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
      this.grid[head_pos.x][head_pos.y][0].className = "snake-square";

      if(this.worldEndingDeathCheck(new_head_pos)) return;

      // draw the head in its new position
      this.grid[new_head_pos.x][new_head_pos.y][0].className = "snake-head-square";
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

      // is the snake about to eat itself?
      if (this.grid[new_head_pos.x][new_head_pos.y][0].className === "snake-square") {
        return true;
      }

      return false;
    },
    foodCheck: function ( food ) {
      var head_pos = this.body[0];

      return (head_pos.equals(food));
    }
  });

  window.App = window.App || {};
  window.App.Snake = Snake;
});
