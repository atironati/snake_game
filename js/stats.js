// format time
String.prototype.formatTime = function () {
    var sec_num = parseInt(this, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    var time;
    if (hours === 0){
        if(minutes === 0) {
            time = seconds + ' seconds';
        } else {
            if (seconds < 10) {seconds = "0"+seconds;}
            time = minutes+':'+seconds + ' minutes';
        }
    } else {
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        time = hours+':'+minutes+':'+seconds;
    }
    return time;
}

// Stats class
$(function(){
  var Stats = function( snake ) {
    this.snake = snake;
    this.startTime = new Date().getTime();
    this.elapsedTime = '0.0'
    this.intervalId = '';
    this.setup();
  };

  $.extend( Stats.prototype, {
    setup: function() {
    },
    startTimer: function( ) {
      this.startTime = new Date().getTime();
      this.elapsedTime = '0.0';

      var that = this;
      this.intervalId = window.setInterval(function() {
        var time = new Date().getTime() - that.startTime;

        that.elapsed = Math.floor(time / 100) / 10;
        if(Math.round(that.elapsed) == that.elapsed) { that.elapsed += '.0'; }

        $('#elapsed-time').text(that.elapsed.toString().formatTime());
      }, 100);

    },
    stopTimer: function( ) {
      window.clearInterval(this.intervalId);
    },
    clearTimer: function( ) {
      $('#elapsed-time').text('');
    },
    updateFoodCount: function() {
      $('#food-eaten').text(this.snake.foodEatenCount);
    },
    updateSnakeSize: function() {
      $('#snake-size').text(this.snake.body.length);
    }
  });

  window.App = window.App || {};
  window.App.Stats = Stats;
});
