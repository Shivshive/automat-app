import "./stylesheets/main.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

// ----------------------------------------------------------------------------
// Everything below is just to show you how it works. You can delete all of it.
// ----------------------------------------------------------------------------

import {
  remote,
  ipcRenderer
} from "electron";
import jetpack from "fs-jetpack";

import env from "env";

import * as Capture from './capture/capture.js';

import {
  home
} from "./pages/home/home.js";

import {
  runScript
} from "./pages/script/runScript.js";


let _templateBase = './pages';

angular.module('app', [
    'ngRoute',
    'ngMaterial',
    'ngAnimate'
  ])
  .run(function ($rootScope) {

    $rootScope.showBackButton = false;

  })
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: _templateBase + '/home/home.html',
      controller: 'HomeController',
      controllerAs: 'vm'
    });
    $routeProvider.when('/list', {
      templateUrl: _templateBase + '/script/list.html',
      controller: 'RunScriptController',
      controllerAs: 'vm'
    });
    $routeProvider.otherwise({
      redirectTo: '/'
    });
  }]);

home();
runScript();
