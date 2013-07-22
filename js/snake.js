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
      head_pos = this.body[0];
      tail_pos = this.body.pop();

      // remove tail
      this.grid[tail_pos[0]][tail_pos[1]][0].className = "empty-square";

      // set old head to regular body part
      this.grid[head_pos[0]][head_pos[1]][0].className = "snake-square";

      // draw new head position
      new_head_pos_y = head_pos[0] + this.direction[0];
      new_head_pos_x = head_pos[1] + this.direction[1];
      this.grid[new_head_pos_y][new_head_pos_x][0].className = "snake-head-square";
      this.body.unshift([new_head_pos_y,new_head_pos_x]);
    }
  });

  window.App = window.App || {};
  window.App.Snake = Snake;
});
