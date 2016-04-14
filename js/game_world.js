$(function(){

  var GameWorld = function( ) {
    this.directions = {37:[-1,0],
                       38:[0,-1],
                       39:[1,0],
                       40:[0,1]};
    this.gameOn = false;
    this.buttonPressed = false;
    this.boardSize = 40;
    this.tileSize = 20;

    // Initialize grid array
    this.grid = new Array(this.boardSize);
    for (var i=0; i < this.boardSize; i++) {
      this.grid[i] = new Array(this.boardSize);
    }

    this.setup();
    // place snake on the grid
    this.snake = new window.App.Snake(this);
    this.stats = new window.App.Stats(this.snake);
    this.food = this.setFoodLocation(this.snake.nextHeadPosition());
    this.snakeController = new SnakeController(this.grid, this.snake);
    this.gameOn = false;
    this.showStartGameScreen();
  };

  $.extend( GameWorld.prototype, {
    setup: function() {
      var containerWidth = this.boardSize * this.tileSize;
      this.el = $( "<div></div>", {"class": "game-board"} );
      this.el.css({"width":containerWidth,"height":containerWidth, "margin-top":-containerWidth/2});
      this.el.appendTo($("#main"));
      var br = $( "<br />" );

      for ( var y=0; y < this.boardSize; y++) {
        var row = $( "<div></div>", {"class": "board-row"} );
        row.css({"width":containerWidth, "height":this.tileSize});
        for ( var x=0; x < this.boardSize; x++) {
          var gamePiece = $( "<div></div>", {"class": "empty-square"} );
          gamePiece.css({"width":this.tileSize-1,"height":this.tileSize-1});
          row.append( gamePiece );
          this.grid[x][y] = gamePiece;
        }
        br.appendTo( row );
        row.appendTo( this.el );
      }

    },
    resetFood: function() {
      this.food = this.setFoodLocation();
    },
    setFoodLocation: function() {
      var snakeBody = this.snake.body.slice(0) // clone snake body so we can mutate it

      // flatten board
      var boardTiles = {};
      var count = 0;
      for ( var y=0; y < this.boardSize; y++) {
        for ( var x=0; x < this.boardSize; x++) {
          boardTiles[count] = new Point(x,y);
          count++;
        }
      }

      // remove each snake index from boardTiles
      // boardTiles is an object so that delete operations are in constant-time
      for (var i = 0; i < snakeBody.length; i++) {
        var indexToRemove = this.flattenedIndex(snakeBody[i]);
        delete boardTiles[indexToRemove]
      }

      // convert boardTiles to an array - this makes it easier to randomly index
      var boardTilesArray = []
      count = 0
      for (var key in boardTiles) {
        boardTilesArray[count] = boardTiles[key]
        count++;
      }

      // randomly set food
      var random   = Math.floor((Math.random() * boardTilesArray.length) - 1);
      var food_loc = boardTilesArray[random];
      this.grid[food_loc.x][food_loc.y][0].className = 'food';

      return new Point(food_loc.x,food_loc.y);
    },
    flattenedIndex: function(pt) {
      return (pt.y * this.boardSize) + pt.x;
    },
    run: function() {
      this.buttonPressed = false;
      this.snake.move();

      this.stats.updateSnakeSize();
      this.stats.updateFoodCount();

      console.log(this.gameOn);
      if (this.gameOn) setTimeout('window.App.GameWorld.run()', 100);
    },
    runAi: function() {
      this.buttonPressed = false;
      this.snakeController.findPath();

      this.stats.updateSnakeSize();
      this.stats.updateFoodCount();

      console.log(this.gameOn);
      if (this.gameOn) setTimeout('window.App.GameWorld.runAi()', 100);
    },
    showStartGameScreen: function() {
      var containerWidth = this.boardSize * this.tileSize;

      startGameScreen = $( "<div></div>", {"id": "start-game"} );
      startGameScreen.css({"width":containerWidth,
                           "height":containerWidth, 
                           "top":0,
                           "left":"50%", 
                           "margin-top":-containerWidth/2, 
                           "margin-left":-containerWidth/2});

      startButton = $( "<input />", {"class": "start-button"});
      startButton.attr("type","button");
      startButton.attr("value","Start Game");
      startButton.attr("onClick","window.App.GameWorld.startGame()");

      startAiButton = $( "<input />", {"class": "start-ai-button"});
      startAiButton.attr("type","button");
      startAiButton.attr("value","Start AI Simulator");
      startAiButton.attr("onClick","window.App.GameWorld.startAiSim()");

      startGameBox = $( "<div></div>", {"id": "start-game-box"} );

      logoDiv = $( "<div></div>", {"id": "snake-logo"});
      br = $( "<br />" );

      startGameBox.append(logoDiv);
      startGameBox.append(startButton);
      startGameBox.append(br);
      startGameBox.append(startAiButton);
      startGameScreen.append(startGameBox);

      this.el.append(startGameScreen);

      var topPosition = (containerWidth/4);
      startGameBox.css({"top":topPosition});
    },

    hideStartGameScreen: function() {
      this.el.find("#start-game").hide();
    },
    startGame: function() {
      this.hideStartGameScreen();
      this.stats.startTimer();
      this.stats.updateFoodCount();
      this.stats.updateSnakeSize();
      this.gameOn = true;
      this.run();
    },
    startAiSim: function() {
      this.hideStartGameScreen();
      this.stats.startTimer();
      this.stats.updateFoodCount();
      this.stats.updateSnakeSize();
      this.gameOn = true;
      this.runAi();
    },
    endGame: function() {
      this.gameOn = false;
      this.stats.stopTimer();
      var containerWidth = this.boardSize * this.tileSize;
      var br = $( "<br />" );

      gameOverScreen = $( "<div></div>", {"id": "game-over"} );
      gameOverScreen.css({"width":containerWidth,"height":containerWidth, "top":0,"left":"50%", "margin-top":-containerWidth/2, "margin-left":-containerWidth/2});

      restartButton = $( "<input />", {"class": "restart-button"});
      restartButton.attr("type","button");
      restartButton.attr("value","Restart");
      restartButton.attr("onClick","window.App.GameWorld.restart()");

      gameOverBox = $( "<div></div>", {"id": "game-over-box"} );
      gameOverBox.text('Game Over');

      gameOverBox.append(br);
      gameOverBox.append(restartButton);
      gameOverScreen.append(gameOverBox);

      this.el.append(gameOverScreen);

      gameOverBox.css({"top":"50%", "margin-top":-gameOverBox.height()/2});
    },
    restart: function() {
      $(".game-board").remove();
      window.App.GameWorld = new GameWorld();
      window.App.GameWorld.startGame();
    }
  });

  $(document).keydown(function(e){
    var gameWorld = window.App.GameWorld;
    var directions = gameWorld.directions;
    var buttonPressed = gameWorld.buttonPressed;
    var snake = gameWorld.snake;

    if (directions[e.keyCode]) {
      gameWorld.buttonPressed = snake.setDirection(directions[e.keyCode]);
    }

    return false;
  });

  window.App = window.App || {};
  window.App.GameWorld = new GameWorld();
});
