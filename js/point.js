  var Point = function( x, y ) {
    this.x = x;
    this.y = y;
    this.equals = function(other) {
        return other.x === this.x && other.y === this.y;
    }
  }
