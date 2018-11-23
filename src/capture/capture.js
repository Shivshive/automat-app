import ioHook from 'iohook';
import uuidv4 from 'uuid/v4';
import keycode from 'keycode';
import robot from "robotjs";

import * as fileHandleRemote from '../helpers/fileHandlerRemote';

const scriptFolder = fileHandleRemote.AppDirExternal().dir("data").dir("scripts")
console.log("capture.js", scriptFolder.path());

var callback = null;
var script = [];

const buttons = {
  1: "left",
  2: "right",
  3: "middle"
};

let startTime = new Date();



const recordTimeDiff = (event) => {
  let endTime = new Date();
  let diff = endTime - startTime;
  startTime = endTime;
  let timeDelay = {
    type: "delay",
    timeout: diff
  };

  console.log(timeDelay);
  event.timeDelay = timeDelay;
};

const recordColor = (event) => {
  let pixelColor = robot.getPixelColor(event.x, event.y);
  console.log(pixelColor);
  event.pixelColor = pixelColor;
};

const checkEvent = (event) => {
  let keyName = keycode(event.rawcode);
  if (keyName) {
    event.keyName = keyName.split(" ").join("_");
    if (event.keyName == "esc") {
      event.keyName = "escape";
    }

    if (event.keyName == "caps_lock") {
      delete event.keyName;
    }
  }

  let modifier = [];
  if (event.shiftKey) {
    modifier.push("shift");
  }
  if (event.ctrlKey) {
    modifier.push("control");
  }
  if (event.altKey) {
    modifier.push("alt");
  }
  if (event.metaKey) {
    modifier.push("command");
  }

  event.modifier = modifier;
  console.log(event);
};

ioHook.on('keydown', event => {
  recordTimeDiff(event);
  checkEvent(event);
  if (event.ctrlKey && event.keyName && event.keyName == "f10") {
    stop(callback);
    return;
  } else if (event.ctrlKey && event.keyName && event.keyName == "f11") {
    addValidation(callback);
    return;
  }
  script.push(event);
});

ioHook.on('keyup', event => {
  recordTimeDiff(event);
  checkEvent(event);
  script.push(event);
});

ioHook.on('mousedown', event => {
  recordTimeDiff(event);
  recordColor(event);
  event.buttonName = buttons[event.button];
  console.log(event);
  script.push(event);
});

ioHook.on('mouseup', event => {
  recordTimeDiff(event);
  recordColor(event);
  event.buttonName = buttons[event.button];
  console.log(event);
  script.push(event);
});

ioHook.on('mousemove', event => {
  recordTimeDiff(event);
  console.log(event);
  script.push(event);
});

ioHook.on('mousedrag', event => {
  event.buttonName = buttons[event.button];
  console.log(event);
  script.push(event);
});

ioHook.on('mousewheel', event => {
  event.buttonName = buttons[event.button];
  console.log(event);
  script.push(event);
});


export const start = (cb) => {
  script = [];
  startTime = new Date();
  callback = cb;
  ioHook.start();
};

export const addValidation = (callback) => {
  ioHook.stop();
  let it = callback ? callback("validation") : null;
};

export const replay = () => {
  ioHook.start();
};

export const stop = (callback) => {
  const scriptId = uuidv4();
  const file = `${scriptId}.json`;
  scriptFolder.writeAsync(file, script).then(() => {
    console.log("new script created..");
  });
  console.log("created input capture script " + file);
  script = [];
  ioHook.stop();
  let it = callback ? callback("stop", scriptId) : null;
};
