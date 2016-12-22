
var HID = require('node-hid');
var logger = require('./logger.js');


var Light = function ()
{
  var ctx = this;
  var vendor = 7476;
  var product = 4;

  var hid = new HID.HID(vendor, product);
  var instructions = [];
  var timer = null;
  var running = false;
  var current_color = [0,0,0];

  // define common colours
  this.COLOR_OFF = [0,0,0];
  this.COLOR_RED = [255, 0, 0];
  this.COLOR_GREEN = [0, 255, 0];
  this.COLOR_BLUE = [0, 0, 255];
  this.COLOR_CYAN = [0, 255, 255];
  this.COLOR_PINK = [255, 0, 255];
  this.COLOR_WHITE = [255, 255, 255];
  this.COLOR_YELLOW = [255, 255, 0];
  this.COLOR_ORANGE = [255, 127, 127];

  // initialize the light
  hid.write([0x00, 0x1F, 0x02, 0x00, 0x5F, 0x00, 0x00, 0x1F, 0x03]);
  hid.write([0x00, 0x00, 0x02, 0x00, 0x5F, 0x00, 0x00, 0x1F, 0x04]);
  hid.write([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1F, 0x05]);
  hid.write([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);

  // listen for errors
  hid.on("error", function(err)
  {
      console.log("HID ERROR");
      console.log(err);
  });

  this.color = function(color)
  {
    // device can only handle 0-64, so scale values from 0-255 to fit
    var scaled_r = Math.round(color[0] / 255 * 64);
    var scaled_g = Math.round(color[1] / 255 * 64);
    var scaled_b = Math.round(color[2] / 255 * 64);
    //console.log(scaled_r + ", " + scaled_g + ", " + scaled_b)
    ctx.write([0x00, scaled_r, scaled_g, scaled_b, 0x00, 0x00, 0x00, 0x1F, 0x05]);
    current_color = color;
    return this;
  };

  this.currentColor = function()
  {
    return current_color;
  }

  this.tween = function(start_color, end_color, duration)
  {
    var update_interval = 50;
    var steps = duration / update_interval;
    for (var i = 0; i < steps; i++)
    {
      var stepped_r = start_color[0] + ((end_color[0] - start_color[0]) / steps) * i;
      var stepped_g = start_color[1] + ((end_color[1] - start_color[1]) / steps) * i;
      var stepped_b = start_color[2] + ((end_color[2] - start_color[2]) / steps) * i;

      this.addInstruction([stepped_r, stepped_g, stepped_b], update_interval);
    }
    this.addInstruction(end_color, update_interval);
    this.run();
  }

  this.addInstruction = function(color, duration)
  {
    instructions.push({
      color:color,
      duration:duration
    });
  }

  this.run = function()
  {
    if (running == false)
    {
      running = true;
      ctx.nextInstruction();
    }
  }

  this.nextInstruction = function()
  {
    if (instructions.length > 0)
    {
      var first_instruction = instructions[0];
      instructions.splice(0, 1);
      timer = setTimeout(ctx.nextInstruction, first_instruction.duration);
      ctx.color(first_instruction.color);
    }
    else
    {
      running = false;
    }
  }

  this.write = function (arBytes)
  {
    hid.write(arBytes);
  };

  this.close = function()
  {
    hid.close();
  }

  this.off = function ()
  {
      ctx.color(this.COLOR_OFF);
  };
}

// make notifier avilable
var light = new Light();
module.exports = light;
