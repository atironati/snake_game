$(function(){

  var GameWorld = function( ) {
    this.directions = {37:[-1,0],
                       38:[0,-1],
                       39:[1,0],
                       40:[0,1]};
    this.gameOn = false;
    this.buttonPressed = false;
    this.boardSize = 30;
    this.tileSize = 20;

    this.currentGameMode = "";

    // Initialize grid array
    this.grid = new Array(this.boardSize);
    for (var i=0; i < this.boardSize; i++) {
      this.grid[i] = new Array(this.boardSize);
    }

    this.setup();
    // place snake on the grid

    var board_center = Math.round(this.boardSize / 2);
    var head_pos = new Point(board_center,board_center);

    this.snakeController = new SnakeController(this.grid);
    this.snake = new window.App.Snake(this, head_pos, "green", "snek", this.snakeController, true, true);

    this.aiSnakes = [];

    this.stats = new window.App.Stats(this.snake);
    this.food = this.setFoodLocation();
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
      var boardTiles = {};

      // flatten board
      var count = 0;
      for ( var y=0; y < this.boardSize; y++) {
        for ( var x=0; x < this.boardSize; x++) {
          boardTiles[count] = new Point(x,y);
          count++;
        }
      }

      if (!(this.snake === undefined)) {
        this.removeSnakeSquaresFromGrid(this.snake, boardTiles);
      }

      var that = this;
      this.aiSnakes.forEach(function(aiSnake) {
        that.removeSnakeSquaresFromGrid(aiSnake, boardTiles);
      });

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
      if (food_loc === undefined) {
        random   = Math.floor((Math.random() * boardTilesArray.length) - 1);
        food_loc = boardTilesArray[random];
      }
      this.grid[food_loc.x][food_loc.y][0].className = 'food';

      return new Point(food_loc.x,food_loc.y);
    },
    removeSnakeSquaresFromGrid: function(snek, boardTiles) {
      var snakeBody = snek.body.slice(0) // clone snake body so we can mutate it

      // remove each snake index from boardTiles
      // boardTiles is an object so that delete operations are in constant-time
      for (var i = 0; i < snakeBody.length; i++) {
        var indexToRemove = this.flattenedIndex(snakeBody[i]);
        delete boardTiles[indexToRemove];
      }
    },
    flattenedIndex: function(pt) {
      return (pt.y * this.boardSize) + pt.x;
    },
    run: function() {
      this.buttonPressed = false;
      this.snake.move();

      this.stats.updateSnakeSize();
      this.stats.updateFoodCount();

      //console.log(this.gameOn);
      if (this.gameOn) setTimeout('window.App.GameWorld.run()', 100);
    },
    runAi: function() {
      this.buttonPressed = false;

      this.snake.runSnakeController(this.food);

      this.stats.updateSnakeSize();
      this.stats.updateFoodCount();

      if (this.gameOn) setTimeout('window.App.GameWorld.runAi()', 30);
    },
    runAiBattle: function() {
      this.buttonPressed = false;

      this.snake.move(this.food);

      var that = this;
      this.aiSnakes.forEach(function(aiSnake) {
        aiSnake.runSnakeController(that.food);
      });

      if (this.gameOn) setTimeout('window.App.GameWorld.runAiBattle()', 80);
    },
    runAiSnakePit: function() {
      this.buttonPressed = false;

      var that = this;
      this.aiSnakes.forEach(function(aiSnake) {
        aiSnake.runSnakeController(that.food);
      });

      if(this.gameWon()) { return; }

      if (this.gameOn) setTimeout('window.App.GameWorld.runAiSnakePit()', 20);
    },
    runAiCrazySnakePit: function() {
      this.buttonPressed = false;

      var that = this;
      this.aiSnakes.forEach(function(aiSnake) {
        aiSnake.runSnakeController(that.food);
      });

      if(this.gameWon()) { return; }

      if (this.gameOn) setTimeout('window.App.GameWorld.runAiCrazySnakePit()', 20);
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

      startButton = $( "<input />", {"id": "start-button", "class" : "menu-button"});
      startButton.attr("type","button");
      startButton.attr("value","Start Game");
      startButton.attr("onClick","window.App.GameWorld.startGame()");

      startAiButton = $( "<input />", {"id": "start-ai-button", "class" : "menu-button"});
      startAiButton.attr("type","button");
      startAiButton.attr("value","Start AI Simulator");
      startAiButton.attr("onClick","window.App.GameWorld.startAiSim()");

      aiBattleButton = $( "<input />", {"id": "ai-battle-button", "class" : "menu-button"});
      aiBattleButton.attr("type","button");
      aiBattleButton.attr("value","Start AI Battle");
      aiBattleButton.attr("onClick","window.App.GameWorld.startAiBattle()");

      aiSnakePitButton = $( "<input />", {"id": "ai-snake-pit-button", "class" : "menu-button"});
      aiSnakePitButton.attr("type","button");
      aiSnakePitButton.attr("value","Enter the AI Snake Pit");
      aiSnakePitButton.attr("onClick","window.App.GameWorld.startAiSnakePit()");

      aiCrazySnakePitButton = $( "<input />", {"id": "ai-snake-pit-button", "class" : "menu-button"});
      aiCrazySnakePitButton.attr("type","button");
      aiCrazySnakePitButton.attr("value","Enter the Crazy AI Snake Pit");
      aiCrazySnakePitButton.attr("onClick","window.App.GameWorld.startAiCrazySnakePit()");

      startGameBox = $( "<div></div>", {"id": "start-game-box"} );

      logoDiv = $( "<div></div>", {"id": "snake-logo"});
      var br = $( "<br />" );

      startGameBox.append(logoDiv);
      startGameBox.append(startButton);
      startGameBox.append(br.clone());
      startGameBox.append(startAiButton);
      startGameBox.append(br.clone());
      startGameBox.append(aiBattleButton);
      startGameBox.append(br.clone());
      startGameBox.append(aiSnakePitButton);
      startGameBox.append(br.clone());
      startGameBox.append(aiCrazySnakePitButton);

      startGameScreen.append(startGameBox);

      this.el.append(startGameScreen);

      var topPosition = (containerWidth/4);
      startGameBox.css({"top":topPosition});
    },

    hideStartGameScreen: function() {
      this.el.find("#start-game").hide();
    },
    startGame: function() {
      this.currentGameMode = "single_player";
      this.hideStartGameScreen();
      this.stats.startTimer();
      this.stats.updateFoodCount();
      this.stats.updateSnakeSize();
      this.gameOn = true;
      this.run();
    },
    startAiSim: function() {
      this.currentGameMode = "ai_simulator";
      this.hideStartGameScreen();
      this.stats.startTimer();
      this.stats.updateFoodCount();
      this.stats.updateSnakeSize();
      this.gameOn = true;
      this.runAi();
    },
    startAiBattle: function() {
      this.currentGameMode = "ai_battle";

      this.clearGrid();

      this.hideStartGameScreen();
      this.stats.startTimer();
      this.stats.updateFoodCount();
      this.stats.updateSnakeSize();
      this.gameOn = true;

      var board_center = Math.round(this.boardSize / 2);
      var quarter_board = Math.round(board_center / 2);
      var eigth_board = Math.round(quarter_board / 2);

      var s1_head_pos = new Point(quarter_board,board_center);
      var s2_head_pos = new Point(quarter_board+eigth_board,board_center);

      this.snake = new window.App.Snake(this, s1_head_pos, "green", "snek", this.snakeController, true, true);
      var snake2 = new window.App.Snake(this, s2_head_pos, "blue", "mean-snek", this.snakeController, true, true);
      this.aiSnakes.push(snake2);

      this.stats.stopTimer();
      this.stats = new window.App.Stats(this.snake);
      this.stats.startTimer();
      this.food = this.setFoodLocation();

      this.runAiBattle();
    },
    startAiSnakePit: function() {
      this.currentGameMode = "ai_snake_pit";

      this.clearGrid();

      this.hideStartGameScreen();
      //this.stats.updateFoodCount();
      //this.stats.updateSnakeSize();
      this.gameOn = true;

      var board_center = Math.round(this.boardSize / 2);
      var quarter_board = Math.round(board_center / 2);
      var eigth_board = Math.round(quarter_board / 2);

      this.snake = undefined; 
      var s1_head_pos = new Point(quarter_board,quarter_board);
      var s2_head_pos = new Point(quarter_board+eigth_board,quarter_board);
      var s3_head_pos = new Point(eigth_board,quarter_board);
      var s4_head_pos = new Point(quarter_board+eigth_board,quarter_board);

      var snake1 = new window.App.Snake(this, s1_head_pos, "green", "harry", this.snakeController, true, false);
      var snake2 = new window.App.Snake(this, s2_head_pos, "blue", "larry", this.snakeController, true, false);
      var snake3 = new window.App.Snake(this, s3_head_pos, "red", "jerry", this.snakeController, true, false);
      var snake4 = new window.App.Snake(this, s4_head_pos, "orange", "phillip", this.snakeController, true, false);
      this.aiSnakes.push(snake1);
      this.aiSnakes.push(snake2);
      this.aiSnakes.push(snake3);
      this.aiSnakes.push(snake4);

      this.stats.stopTimer();
      this.stats = new window.App.Stats(this.snake);
      this.stats.startTimer();

      this.food = this.setFoodLocation();

      this.runAiSnakePit();
    },
    startAiCrazySnakePit: function() {
      this.currentGameMode = "ai_crazy_snake_pit";

      this.clearGrid();

      this.hideStartGameScreen();
      //this.stats.updateFoodCount();
      //this.stats.updateSnakeSize();
      this.gameOn = true;

      var board_center = Math.round(this.boardSize / 2);
      var quarter_board = Math.round(board_center / 2);
      var eighth_board = Math.round(quarter_board / 2);
      var sixteenth_board = Math.round(eighth_board / 2);

      this.snake = undefined; 
      var s1_head_pos = new Point(eighth_board,quarter_board);
      var s2_head_pos = new Point(quarter_board,quarter_board);
      var s3_head_pos = new Point(board_center,quarter_board);
      var s4_head_pos = new Point(board_center+eighth_board,quarter_board);

      var s9_head_pos = new Point(board_center+quarter_board,quarter_board);

      var s5_head_pos = new Point(quarter_board,board_center+quarter_board);
      var s6_head_pos = new Point(quarter_board+eighth_board,board_center+quarter_board);
      var s7_head_pos = new Point(eighth_board,board_center+quarter_board);
      var s8_head_pos = new Point(board_center+eighth_board,board_center+quarter_board);

      var s10_head_pos = new Point(board_center+quarter_board,board_center+quarter_board);

      var snake1 = new window.App.Snake(this, s1_head_pos, "green",  "harry",     this.snakeController, true, false);
      var snake2 = new window.App.Snake(this, s2_head_pos, "blue",   "larry",     this.snakeController, true, false);
      var snake3 = new window.App.Snake(this, s3_head_pos, "red",    "jerry",     this.snakeController, true, false);
      var snake4 = new window.App.Snake(this, s4_head_pos, "orange", "phillip",   this.snakeController, true, false);
      var snake5 = new window.App.Snake(this, s5_head_pos, "yellow", "jimmy",     this.snakeController, true, false);
      var snake6 = new window.App.Snake(this, s6_head_pos, "purple", "constable", this.snakeController, true, false);
      var snake7 = new window.App.Snake(this, s7_head_pos, "pink",   "billy",     this.snakeController, true, false);
      var snake8 = new window.App.Snake(this, s8_head_pos, "brown",  "archibald", this.snakeController, true, false);
      var snake9 = new window.App.Snake(this, s9_head_pos, "aquamarine", "finn", this.snakeController, true, false);
      var snake10 = new window.App.Snake(this, s10_head_pos, "olive",  "henry", this.snakeController, true, false);

      this.aiSnakes.push(snake1);
      this.aiSnakes.push(snake2);
      this.aiSnakes.push(snake3);
      this.aiSnakes.push(snake4);
      this.aiSnakes.push(snake5);
      this.aiSnakes.push(snake6);
      this.aiSnakes.push(snake7);
      this.aiSnakes.push(snake8);
      this.aiSnakes.push(snake9);
      this.aiSnakes.push(snake10);

      this.stats.stopTimer();
      this.stats = new window.App.Stats(this.snake);
      this.stats.startTimer();

      this.food = this.setFoodLocation();

      this.runAiCrazySnakePit();
    },
    winGame: function(winner) {
      this.stats.stopTimer();
      this.gameOn = false;
      this.stats.stopTimer();
      var containerWidth = this.boardSize * this.tileSize;
      var br = $( "<br />" );

      gameWinScreen = $( "<div></div>", {"id": "game-win"} );
      gameWinScreen.css({"width":containerWidth,"height":containerWidth, "top":0,"left":"50%", "margin-top":-containerWidth/2, "margin-left":-containerWidth/2});

      mainMenuButton = $( "<input />", {"id": "main-menu-button", "class": "menu-button"});
      mainMenuButton.attr("type","button");
      mainMenuButton.attr("value","Main Menu");
      mainMenuButton.attr("onClick","window.App.GameWorld.mainMenu()");

      restartButton = $( "<input />", {"class": "restart-button"});
      restartButton.attr("type","button");
      restartButton.attr("value","Restart");
      restartButton.attr("onClick","window.App.GameWorld.restart()");

      gameWinBox = $( "<div></div>", {"id": "game-win-box"} );
      gameWinBox.append('Game Win');
      gameWinBox.append(br.clone());
      gameWinBox.append('Winner : ' + this.capitalizeFirstLetter(winner.color) + ' Snake');
      gameWinBox.append(br.clone());

      gameWinBox.append(br.clone());
      gameWinBox.append(mainMenuButton);
      gameWinBox.append(br.clone());
      gameWinBox.append(restartButton);
      gameWinScreen.append(gameWinBox);

      this.el.append(gameWinScreen);

      gameWinBox.css({"top":"50%", "margin-top":-gameWinBox.height()/2});
    },
    endGame: function() {
      this.stats.stopTimer();
      this.gameOn = false;
      this.stats.stopTimer();
      var containerWidth = this.boardSize * this.tileSize;
      var br = $( "<br />" );

      gameOverScreen = $( "<div></div>", {"id": "game-over"} );
      gameOverScreen.css({"width":containerWidth,"height":containerWidth, "top":0,"left":"50%", "margin-top":-containerWidth/2, "margin-left":-containerWidth/2});

      mainMenuButton = $( "<input />", {"id": "main-menu-button", "class": "menu-button"});
      mainMenuButton.attr("type","button");
      mainMenuButton.attr("value","Main Menu");
      mainMenuButton.attr("onClick","window.App.GameWorld.mainMenu()");

      restartButton = $( "<input />", {"id": "restart-button", "class": "menu-button"});
      restartButton.attr("type","button");
      restartButton.attr("value","Restart");
      restartButton.attr("onClick","window.App.GameWorld.restart()");

      gameOverBox = $( "<div></div>", {"id": "game-over-box"} );
      gameOverBox.text('Game Over');

      gameOverBox.append(br.clone());
      gameOverBox.append(mainMenuButton);
      gameOverBox.append(br.clone());
      gameOverBox.append(restartButton);
      gameOverScreen.append(gameOverBox);

      this.el.append(gameOverScreen);

      gameOverBox.css({"top":"50%", "margin-top":-gameOverBox.height()/2});
    },
    mainMenu: function() {
      $(".game-board").remove();
      window.App.GameWorld = new GameWorld();
    },
    restart: function() {
      $(".game-board").remove();
      this.clearGrid();
      this.stats.clearTimer();

      this.aiSnakes.forEach(function(aiSnake) {
        delete aiSnake;
      });

      window.App.GameWorld = new GameWorld();

      if (this.currentGameMode === "single_player") {
        window.App.GameWorld.startGame();
      } else if (this.currentGameMode === "ai_simluator") {
        window.App.GameWorld.startAiSim();
      } else if (this.currentGameMode === "ai_battle") {
        window.App.GameWorld.startAiBattle();
      } else if (this.currentGameMode === "ai_snake_pit") {
        window.App.GameWorld.startAiSnakePit();
      } else if (this.currentGameMode === "ai_crazy_snake_pit") {
        window.App.GameWorld.startAiCrazySnakePit();
      }
    },
    highlightPath: function(snake, path) {
      // remove old path first -- inefficient, should change when you have time
      for ( var x=0; x < this.boardSize; x++) {
        for ( var y=0; y < this.boardSize; y++) {
          // uncomment this for some wacky fun
          //if(this.grid[x][y][0].className === snake.name+"-ghost-path") {
          if(this.grid[x][y][0].className.split(" ").includes(snake.name+"-ghost-path")) {
            this.grid[x][y][0].className = "empty-square";
          }
        }
      }

      var that = this;

      path.forEach(function(element, index, array) {
        if((snake.body[0].x != element[0] || snake.body[0].y != element[1]) &&
        (that.food.x != element[0] || that.food.y != element[1]))
         that.grid[element[0]][element[1]][0].className = snake.name+"-ghost-path ghost-path";
      });
    },
    clearGrid: function() {
      for ( var x=0; x < this.boardSize; x++) {
        for ( var y=0; y < this.boardSize; y++) {
          this.grid[x][y][0].className = "empty-square";
        }
      }
    },
    capitalizeFirstLetter: function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    gameWon: function() {
      var deadSnakes = 0;
      var winner;
      this.aiSnakes.forEach(function(aiSnake) {
        if(aiSnake.dead) {
          deadSnakes += 1;
        } else {
          winner = aiSnake;
        }
      });

      if ((this.aiSnakes.length - deadSnakes) === 1) {
        this.winGame(winner);
        return true;
      }

      if ((this.aiSnakes.length - deadSnakes) === 0) {
        this.winGame();
        return true;
      }

      return false;
    },
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
