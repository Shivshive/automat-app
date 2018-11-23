const robot = require("robotjs");
const fs = require('fs-extra');
const path = require('path');
// const ioHook = require('iohook');
const keycode = require('keycode');
var events = require('events');

var Capture = function (data) {
  this.data = data;
};

Capture.prototype = new events.EventEmitter();
Capture.prototype.fire = function () {
  this.i = 0;
  var self = this;
  setInterval(function () {
    self.emit('next');
  }, 5);
}

const checkColor = (event) => {
  let pixelColor = robot.getPixelColor(event.x, event.y);
  console.log(pixelColor, event.pixelColor == pixelColor);
  return event.pixelColor == pixelColor;
}

Capture.prototype.next = function () {
  var event = this.data[this.i++];
  if (!event) return;
  var self = this;
  //robot.setMouseDelay(10);
  //robot.setKeyboardDelay(20);
  console.log(this.i, event);
  if (event.type == "mousemove") {
    robot.moveMouse(event.x, event.y);
  } else if (event.type == "mousedown" && event.buttonName) {
    robot.mouseToggle("down", event.buttonName);
  } else if (event.type == "mouseup" && event.buttonName) {
    robot.mouseToggle("up", event.buttonName);
  } else if (event.type == "mousedrag") {
    robot.dragMouse(event.x, event.y);
  } else if (event.type == "mousewheel") {
    robot.setMouseDelay(50);
    robot.scrollMouse(0, event.amount * event.rotation * -30);
  } else if (event.type == "keydown" && event.keyName) {
    robot.keyToggle(event.keyName, "down", event.modifier);
  } else if (event.type == "keyup" && event.keyName) {
    robot.keyToggle(event.keyName, "up", event.modifier);
  }

  // if(!checkColor(event) && (event.type == "mousedown")){
  //    console.log("script ends due to mismatch in mouse position..");
  //    let it = this.callback ? this.callback() : null;
  //    return;
  // }

  if (this.i < this.data.length) {

    setInterval(function () {
      self.emit('next');
      // }, event.timeDelay ?  event.timeDelay.timeout : 5);
    }, 5);
  } else {
    console.log("script finished running..");
    let it = this.callback ? this.callback() : null;
  }
}



// ioHook.on('keydown', event => {
//     console.log(event);
//     event.keyName = keycode(event.rawcode);
//     if (event.ctrlKey && event.keyName && event.keyName == "c") {
//         process.exit(0);
//         return;
//     }
// });





export const run = (data, callback) => {
  // const fileId = "4ef639db-864a-4b55-9d4b-732c9caf28ea";
  // const file = path.join(__dirname, fileId + ".json");

  // const data = fs.readJsonSync(file);

  var doCapture = new Capture(data);

  doCapture.on('next', function (event) {
    this.next();
  });
  doCapture.callback = callback;
  doCapture.fire();
}
