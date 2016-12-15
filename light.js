
var HID = require('node-hid');


var Light = function () {

    var ctx = this;
    var vendor = 7476;
    var product = 4;

    var hid = new HID.HID(vendor, product);
    var instructions = [];
    var timer = null;
    var running = false;

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

  this.color = function (color) {
      var hex_r = parseInt(color[0].toString(16), 16);
      var hex_g = parseInt(color[1].toString(16), 16);
      var hex_b = parseInt(color[2].toString(16), 16);
      ctx.write([0x00, hex_r, hex_g, hex_b, 0x00, 0x00, 0x00, 0x1F, 0x05]);
      return this;
  };

  this.addInstruction = function(color, duration) {
    instructions.push({
        color:color,
        duration:duration
      });

      if (running == false)
      {
        ctx.run();
      }
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
      console.log("Done");
    }
  }

  this.write = function (arBytes) {
      hid.write(arBytes);
  };

  this.close = function() {
    hid.close();
  }

  this.off = function () {
      ctx.color(this.COLOR_OFF);
  };
}

// make notifier avilable
var light = new Light();
module.exports = light;
