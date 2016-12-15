
var HID = require('node-hid');


var Light = function () {
    var vendor = 7476;
    var product = 4;
    this.hid = new HID.HID(vendor, product);

    // define common colours
    this.COLOR_OFF = [0,0,0];
    this.COLOR_RED = [255, 0, 0];
    this.COLOR_GREEN = [0, 255, 0];
    this.COLOR_BLUE = [0, 0, 255];
    this.COLOR_YELLOW = [255, 255, 0];
    this.COLOR_CYAN = [0, 255, 255];
    this.COLOR_PINK = [255, 0, 255];
    this.COLOR_WHITE = [255, 255, 255];

    // initialize the light
    this.hid.write([0x00, 0x1F, 0x02, 0x00, 0x5F, 0x00, 0x00, 0x1F, 0x03]);
    this.hid.write([0x00, 0x00, 0x02, 0x00, 0x5F, 0x00, 0x00, 0x1F, 0x04]);
    this.hid.write([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1F, 0x05]);
    this.hid.write([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);

    // listen for errors
    this.hid.on("error", function(err)
    {
        console.log("HID ERROR");
        console.log(err);
    });
};

Light.prototype.color = function (color) {
    var hex_r = parseInt(color[0].toString(16), 16);
    var hex_g = parseInt(color[1].toString(16), 16);
    var hex_b = parseInt(color[2].toString(16), 16);
    this.write([0x00, hex_r, hex_g, hex_b, 0x00, 0x00, 0x00, 0x1F, 0x05]);
    return this;
};

Light.prototype.write = function (arBytes) {
    this.hid.write(arBytes);
};

Light.prototype.close = function() {
  this.hid.close();
}

Light.prototype.off = function () {
    this.color(this.COLOR_OFF);
    return this;
};

// make notifier avilable
var light = new Light();
module.exports = light;
