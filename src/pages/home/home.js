import {
  remote,
  ipcRenderer
} from "electron";
import jetpack from "fs-jetpack";
import path from 'path';
import * as RobotJS from 'robotjs';
import uuidv4 from 'uuid/v4';
import {
  spawnSync
} from 'child_process';

import Notifier from 'node-notifier';
console.log(Notification);
import Nircmd from 'node-nircmd';
const cmd = Nircmd();
import * as Capture from '../../capture/capture.js';
import * as fileHandleRemote from '../../helpers/fileHandlerRemote';

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

const scriptFolder = fileHandleRemote.AppDirExternal().dir("data").dir("scripts");
console.log("capture.js", scriptFolder.path());

const validationFolder = fileHandleRemote.AppDirExternal().dir("log").dir("validations");

const manifest = appDir.read("package.json", "json");

const osMap = {
  win32: "Windows",
  darwin: "macOS",
  linux: "Linux"
};



export
const home = () => {
  angular.module('app')
    .controller('HomeController', HomeController);
  console.log("Loading  HomeController ");


  function HomeController($scope, $rootScope, $q, $mdDialog, $location) {
    console.log("HomeController");
    let vm = this;
    $rootScope.showBackButton = false;

    vm.greet = "Capture And Automat Your Machine";

    vm.os = osMap[process.platform];


    vm.author = manifest.author;

    vm.newScript = (event) => {
      console.log("New Script");
      remote.getCurrentWindow().hide();
      var confirm = $mdDialog.confirm()
        .title('New Script')
        .textContent("Do Your Action and to exit press F10.")
        .ok('Exit')
        .targetEvent(event);

      Capture.start((type, data) => vm.callback(event, type, data));

      $mdDialog.show(confirm).then(() => {
        Capture.stop((type, scriptId) => {
          remote.getCurrentWindow().show();
          vm.showAlert(event, scriptId);
        });
      }, () => {

      });

    };

    vm.callback = (event, type, data) => {

      if (type == "stop") {
        remote.getCurrentWindow().show();
        $mdDialog.cancel(confirm);
        vm.showAlert(event, data);
      } else if (type == "validation") {
        vm.showAddValidation(event);
      }
    };

    vm.showAddValidation = (event) => {
      console.log("add validation to script");
      vm.size = RobotJS.getScreenSize();
      //vm.screen = RobotJS.screen.capture();

      Notifier.notify({
        title: 'Add Validation',
        message: 'Clip the area to validate with script..!'
      });

      //console.log(vm.screen);
      const validationId = uuidv4();
      const file = `${validationId}.png`;
      vm.imgPath = path.join(validationFolder.path(), file);
      console.log("creating validation breakpoint in script " + file);

      cmd.spawn("savescreenshot", vm.imgPath, (err, out) => {
        remote.getCurrentWindow().show();
        console.log(err, out);
        if (!err) {
          console.log("validation breakpoint created..");
          $scope.$apply();
          vm.showValidation();
        }
      });
    };

    vm.showValidation = () => {
      $mdDialog.show({
          controller: AddValidationController,
          templateUrl: './pages/home/addValidation.html',
          parent: angular.element(document.body),
          ariaLabel: "Add Validation",
          targetEvent: event,
          clickOutsideToClose: false,
          fullscreen: true, // Only for -xs, -sm breakpoints.
          locals: {
            imgPath: vm.imgPath,
            size: vm.size
          }
        })
        .then(function (rect) {

          if (rect) {
            console.log('cliping validation area..', rect);
            cmd.spawn("savescreenshot", [vm.imgPath, rect.x, rect.y, 100, 100], (err, out) => {
              console.log(err, out);
              if (!err) {
                console.log("cliped validation area...");
              }
            });
          }
          remote.getCurrentWindow().hide();
          Capture.replay();

        }, function () {
          validationFolder.removeAsync(file);
          remote.getCurrentWindow().hide();
          Capture.replay();
          console.log('You cancelled the add validation dialog.');
        });
    }



    vm.showAlert = (event, scriptId) => {
      var confirm = $mdDialog.prompt()
        .title('New Script')
        .textContent("Created new Script. Please give it a name..")
        .placeholder('Script name')
        .ariaLabel('Script name')
        .initialValue(scriptId)
        .required(true)
        .ok('Save')
        .cancel('Delete')
        .targetEvent(event);
      $mdDialog.show(confirm).then((result) => {
        scriptFolder.rename(`${scriptId}.json`, `${result}.json`);
        console.log("saving new script with file name " + result);
      }, () => {
        scriptFolder.remove(`${scriptId}.json`);
        console.log("deleted new script with file name " + scriptId);
      });
    };

    vm.runScript = () => {
      console.log($mdDialog);
      console.log("Run Script");
      $location.path("/list");
    };
  }
};

function AddValidationController($scope, $mdDialog, imgPath, size) {
  var vm = this;
  $scope.imgPath = imgPath;
  $scope.size = size;
  $scope.style = {
    "width": `${size.width }px`,
    "height": `${size.height }px`
  };
  console.log(imgPath);
  $scope.hide = function () {
    $mdDialog.hide();
  };

  $scope.cancel = function () {
    $mdDialog.cancel();
  };

  $scope.validation = function () {
    let rect = {
      x: $scope.dragger.x,
      y: $scope.dragger.y,
      size: 100
    };
    console.log(rect);
    $mdDialog.hide(rect);
  };

  angular.element(function () {
    console.log('page loading completed');
    $scope.init();
  });

  $scope.init = () => {
    console.log("init canvas..");
    var stage = new createjs.Stage("demoCanvas");

    var bitmap = new createjs.Bitmap($scope.imgPath);
    stage.addChild(bitmap);

    var react = new createjs.Shape();
    react.graphics.beginFill("DeepSkyBlue").beginStroke("#000000").drawRect(0, 0, 100, 100);
    react.x = 0;
    react.y = 0;


    var dragger = $scope.dragger = new createjs.Container();
    dragger.x = dragger.y = 0;
    dragger.alpha = 0.5;
    dragger.addChild(react);
    stage.addChild(dragger);


    dragger.on("pressmove", function (evt) {
      evt.currentTarget.x = evt.stageX - 50;
      evt.currentTarget.y = evt.stageY - 50;
    });

    bitmap.on("click", (evt) => {
      dragger.x = evt.stageX - 50;
      dragger.y = evt.stageY - 50;
    });

    createjs.Ticker.on("tick", stage);
  };
}
