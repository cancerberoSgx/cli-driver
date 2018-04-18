// Node
var robot = require ("robot-js");

var mouse = robot.Mouse();
// Click the right button
// mouse.click (robot.BUTTON_RIGHT);

// Get current mouse position
var pos = robot.Mouse.getPos();

// Move the mouse left
// and up by 50 pixels
for (let i = 0; i < 10; i++) {
robot.Timer.sleep (333);
pos = robot.Mouse.getPos();
robot.Mouse.setPos (pos.sub (50));
}

// Change default auto delay
mouse.autoDelay.min = 100;
mouse.autoDelay.max = 200;

// Maybe select text in an editor
mouse.press   (robot.BUTTON_LEFT);
mouse.scrollV (4); // up
mouse.release (robot.BUTTON_LEFT);

while (true)
{
    // Press left and right
    // buttons to exit loop
    var s = robot.Mouse.getState();
    if (s[robot.BUTTON_LEFT ] &&
        s[robot.BUTTON_RIGHT])
        break;

    // Avoid busy waiting
    robot.Timer.sleep (15);
}