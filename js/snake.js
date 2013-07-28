$(function(){

  var Snake = function( gw ) {
    this.body = new Array(3);
    for (var i=0; i < 3; i++){
      this.body[i] = new Array(2);
    }
    this.gameWorld = gw;
    this.grid = this.gameWorld.grid;
    this.directions = {'moveLeft':[0,-1],
                       'moveUp':[-1,0],
                       'moveRight':[0,1],
                       'moveDown':[1,0]}
    this.direction = this.directions['moveUp'];
    this.foodEatenCount = 0;
    this.setup();
  };

  $.extend( Snake.prototype, {
    setup: function() {
      head_pos = Math.round(this.gameWorld.boardSize / 2);

      this.grid[head_pos][head_pos][0].className = "snake-head-square";
      this.body[0] = [head_pos,head_pos];
      this.grid[head_pos+1][head_pos][0].className = "snake-square";
      this.body[1] = [head_pos+1,head_pos];
      this.grid[head_pos+2][head_pos][0].className = "snake-square";
      this.body[2] = [head_pos+2,head_pos];

      // alert(grid[0][0][0].className);
    },
    setDirection: function( dir ) {
      this.direction = this.directions[dir];
    },
    move: function() {
      var head_pos = this.body[0];
      var tail_pos = this.body.pop();
      var new_head_pos_y = head_pos[0] + this.direction[0];
      var new_head_pos_x = head_pos[1] + this.direction[1];

      // is the snake about to eat food?
      if (new_head_pos_y === this.gameWorld.food[0] &&
          new_head_pos_x === this.gameWorld.food[1]) {
        this.foodEatenCount++;
        this.body.push(tail_pos); // grow
        this.gameWorld.resetFood();
      }

      // remove tail
      this.grid[tail_pos[0]][tail_pos[1]][0].className = "empty-square";

      // set old head to regular body part
      this.grid[head_pos[0]][head_pos[1]][0].className = "snake-square";

      // is the snake about to go off the grid?
      if ((new_head_pos_y < 0 || new_head_pos_y >= this.grid.length) ||
          (new_head_pos_x < 0 || new_head_pos_x >= this.grid[0].length)) {
        this.gameWorld.endGame();
        return;
      }

      // is the snake about to eat itself?
      if (this.grid[new_head_pos_y][new_head_pos_x][0].className === "snake-square") {
        this.gameWorld.endGame();
        return;
      }

      // draw the head in its new position
      this.grid[new_head_pos_y][new_head_pos_x][0].className = "snake-head-square";
      this.body.unshift([new_head_pos_y,new_head_pos_x]);
    },
    foodCheck: function ( food ) {
      head_pos = this.body[0];

      return (head_pos === food);
    }
  });

  window.App = window.App || {};
  window.App.Snake = Snake;
});
