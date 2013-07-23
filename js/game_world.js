$(function(){

  var GameWorld = function( ) {
    this.gameOn = false;
    this.boardSize = 20;
    this.tileSize = 20;

    // Initialize grid array
    this.grid = new Array(this.boardSize);
    for (var i=0; i < this.boardSize; i++) {
      this.grid[i] = new Array(this.boardSize);
    }

    this.setup();
    // place snake on the grid
    this.snake = new window.App.Snake(this);
    this.food = this.setFoodLocation();
    this.gameOn = true;
    this.run();
  };

  $.extend( GameWorld.prototype, {

    setup: function() {
      var containerWidth = this.boardSize * this.tileSize;
      this.el = $( "<div></div>", {"class": "game-board"} );
      this.el.css({"width":containerWidth,"height":containerWidth, "margin-top":-containerWidth/2});
      this.el.appendTo($("#main"));
      var br = $( "<br />" );

      for ( var i=0; i < this.boardSize; i++) {
        var row = $( "<div></div>", {"class": "board-row"} );
        row.css({"width":containerWidth, "height":this.tileSize});
        for ( var j=0; j < this.boardSize; j++) {
          var gamePiece = $( "<div></div>", {"class": "empty-square"} );
          gamePiece.css({"width":this.tileSize-1,"height":this.tileSize-1});
          row.append( gamePiece );
          this.grid[i][j] = gamePiece;
        }
        br.appendTo( row );
        row.appendTo( this.el );
      }

    },
    resetFood: function() {
      // this.grid[this.food[0]][this.food[1]][0].className = "empty-square";
      this.food = this.setFoodLocation();
    },
    setFoodLocation: function() {
      var boardTiles = new Array();
      var count = 0;
      for ( var y=0; y < this.boardSize; y++) {
        for ( var x=0; x < this.boardSize; x++) {
          boardTiles[count] = [y,x];
          count++;
        }
      }

      // remove each snake position
      var that = this;
      $.each(this.snake.body, function(i,val){
        indexToRemove = (val[0] * that.boardSize) + val[1];
        boardTiles.splice(indexToRemove,1);
      });

      // randomly set food
      var random = Math.floor((Math.random() * boardTiles.length) - 1);
      var food_loc = boardTiles[random];
      this.grid[food_loc[0]][food_loc[1]][0].className = 'food';
      return [food_loc[0],food_loc[1]];
    },
    run: function() {
      this.snake.move();

      if (this.gameOn) setTimeout('window.App.GameWorld.run()', 100);
    }
  });

  $(document).keydown(function(e){
    var snake = window.App.GameWorld.snake;
    var dirs = snake.directions;
    var dir = snake.direction;
    var oppDir = [-dir[0],-dir[1]]

    if (e.keyCode == 37) { 
      if (dir !== dirs["moveRight"]) {
        snake.setDirection("moveLeft");
      }
      return false;
    }
    if (e.keyCode == 38) { 
      if (dir !== dirs["moveDown"]) {
        snake.setDirection("moveUp");
      }
      return false;
    }
    if (e.keyCode == 39) { 
      if (dir !== dirs["moveLeft"]) {
        snake.setDirection("moveRight");
      }
      return false;
    }
    if (e.keyCode == 40) { 
      if (dir !== dirs["moveUp"]) {
       snake.setDirection("moveDown");
      }
      return false;
    }
  });


  window.App = window.App || {};
  window.App.GameWorld = new GameWorld();
});
