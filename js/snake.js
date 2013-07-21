$(function(){

  var GameWorld = function( ) {
    this.gameOn = false;
    this.boardSize = 20;
    this.tileSize = 20;
    this.setup();
  };

  $.extend( GameWorld.prototype, {
    setup: function() {
      containerWidth = this.boardSize * this.tileSize;
      this.el = $( "<div></div>", {"class": "game-board"} );
      this.el.css({"width":containerWidth,"height":containerWidth, "margin-top":-containerWidth/2});
      this.el.appendTo($("#main"));
      br = $( "<br />" );

      for ( var i=0; i < this.boardSize; i++) {
        row = $( "<div></div>", {"class": "board-row"} );
        row.css({"width":containerWidth, "height":this.tileSize});
        for ( var j=0; j < this.boardSize; j++) {
          gamePiece = $( "<div></div>", {"class": "empty-square"} );
          gamePiece.css({"width":this.tileSize-1,"height":this.tileSize-1});
          row.append( gamePiece );
        }
        br.appendTo( row );
        row.appendTo( this.el );
      }

    },
    run: function() {
      // do something
      if (gameOn) setTimeout('doGame()', 400);
    }
  });

  window.App = window.App || {};
  window.App.GameWorld = new GameWorld();
});
