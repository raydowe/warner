
var light = require('./light.js');

// change to a custom colour
var red = 255;
var green = 255;
var blue = 255;
var my_color = [red, green, blue];
light.color(my_color);

// change to a predefined colour (see light.js for options)
light.color(light.COLOR_BLUE);

// set the USB to 'OFF' when program ends
process.on('SIGINT', function () {
    light.color('OFF');
    light.close();
    process.exit();
});
