import {
  remote,
  ipcRenderer
} from "electron";
import jetpack from "fs-jetpack";

import path from "path";

import * as CaptureRun from "../../capture/capture-run";

//const app = remote.app;
//const appDir = jetpack.cwd(app.getAppPath());
//const scriptFolderLocation = path.join(app.getAppPath().replace("app.asar", ""), "data");
//const scriptFolder = jetpack.cwd(scriptFolderLocation);
//console.log(scriptFolderLocation, scriptFolder);


import * as fileHandleRemote from '../../helpers/fileHandlerRemote';

const scriptFolder = fileHandleRemote.AppDirExternal().dir("data").dir("scripts")
console.log(scriptFolder.path());


export const runScript = () => {
    angular.module('app').controller('RunScriptController', RunScriptController);
    
    console.log("Loading RunScriptController ");

    function RunScriptController($scope, $rootScope, $location, $timeout, $mdDialog) {
      
      console.log("RunScriptController");
      
      let vm = this;
      $rootScope.showBackButton = true;

      $rootScope.goBack = () => {
        $location.path("/");
      };

      const readScripts = () => {
        scriptFolder.listAsync().then((list) => {
          console.log(list);
          vm.scripts = list;
          $scope.$apply();
        });
      };
      readScripts();

      vm.runScript = (script) => {
        console.log("Running Script" + script);
        scriptFolder.readAsync(script, "json").then(data => {
          //console.log(data);
          var alter = $mdDialog.alert()
            .title('Run Script')
            .textContent("Running Script " + script)
            .ok('Ok')
            .targetEvent(event);
          $mdDialog.show(alter);
          CaptureRun.run(data, () => {
            $mdDialog.cancel(alter);
            var alter2 = $mdDialog.alert()
              .title('Run Script')
              .textContent("Running Script Completed..")
              .ok('Ok')
              .targetEvent(event);
            $mdDialog.show(alter2);
          });
        });
      };

      vm.deleteScript = (script) => {
        console.log("delete Script" + script);

        var confirm = $mdDialog.confirm()
          .title('Delete Script')
          .textContent(script + ", Do want to Delete this script file?")
          .ok('Yes')
          .cancel('No')
          .targetEvent(event);

        $mdDialog.show(confirm).then(() => {
          console.log("deleting Script" + script);
          scriptFolder.remove(script);
          readScripts();
          vm.showAlert(event);

        }, () => {

        });
      };

      vm.showAlert = (event) => {
        var alter = $mdDialog.alert()
          .title('Delete Script')
          .textContent("Script deleted successfully..")
          .ok('Ok')
          .targetEvent(event);
        $mdDialog.show(alter);
      };

    }

  };
