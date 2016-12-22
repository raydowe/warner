
var Logger = function()
{
  var ctx = this;

  this.log = function(statement)
  {
    console.log(ctx.getTimestamp() + ": " + statement);
  }

  this.getTimestamp = function()
  {
    var date = new Date();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;

    var str = date.getFullYear() + "-" + month + "-" + day + " " +  hour + ":" + min + ":" + sec;

    return str;
  }
}

// make notifier avilable
var logger = new Logger();
module.exports = logger;
