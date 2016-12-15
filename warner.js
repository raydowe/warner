
var light = require('./light.js');

var flash_speed = 50;
for (var i = 0; i < 50; i++)
{
  light.addInstruction(light.COLOR_RED, flash_speed);
  light.addInstruction(light.COLOR_BLUE, flash_speed);
  light.addInstruction(light.COLOR_GREEN, flash_speed);
  light.addInstruction(light.COLOR_PINK, flash_speed);
  light.addInstruction(light.COLOR_CYAN, flash_speed);
  light.addInstruction(light.COLOR_YELLOW, flash_speed);
  light.addInstruction(light.COLOR_WHITE, flash_speed);
}

// set the USB to 'OFF' when program ends
process.on('SIGINT', function () {
    light.color('OFF');
    light.close();
    process.exit();
});
