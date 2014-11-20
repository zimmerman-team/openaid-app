// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('openaid', ['ionic', 'openaid.controllers', 'openaid.services', 'openaid.directives','ngCordova'])
    .constant("APPINFO", {
      "OIPA_URL": "http://dev.oipa.openaidsearch.org/api/v3"
    })

.run(function($ionicPlatform, $rootScope, $window, $ionicModal, LocalStorage, $cordovaSplashscreen) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    }
    if(window.StatusBar) {
      StatusBar.styleBlackTranslucent();
    }
    if(ionic.Platform.isAndroid()){
      //alert('android!');
    }

    LocalStorage.get();

    $ionicModal.fromTemplateUrl('templates/modal-internet.html', {
      scope: $rootScope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $rootScope.internetModal = modal;
    });
    $rootScope.openInternetRequiredModal = function() {
      if(ionic.Platform.isIOS()){
        StatusBar.styleDefault();
      }

      $rootScope.internetModal.show();
    };
    $rootScope.closeInternetRequiredModal = function() {
      $rootScope.internetModal.hide();
    };

    $rootScope.$on('modal.hidden', function() {
      if(ionic.Platform.isIOS()){
        StatusBar.styleBlackTranslucent();
      }
    });



    $rootScope.online = navigator.onLine;
    $window.addEventListener("offline", function () {
      $rootScope.$apply(function() {
        $rootScope.online = false;
        setTimeout(function(){
          if(!$rootScope.online) {
            $rootScope.openInternetRequiredModal();
          }
        }, 1000);

      });
    }, false);
    $window.addEventListener("online", function () {
      $rootScope.$apply(function() {
        $rootScope.online = true;
        $rootScope.closeInternetRequiredModal();
      });
    }, false);

    setTimeout(function() {
      $cordovaSplashscreen.hide()
    }, 1000)

  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive

        // setup an abstract state for the tabs directive
          .state('menu', {
            url: "/menu",
            abstract: true,
            templateUrl: "templates/menu.html"
          })
          .state('menu.home', {
            url: "/home",
            views: {
              'menuContent' :{
                templateUrl: "templates/home.html"
              }
            }
          })
          .state('menu.about', {
            url: "/about",
            views: {
              'menuContent' :{
                templateUrl: "templates/about.html",
                controller: "AboutCtrl"
              }
            }
          })
          .state('menu.filter', {
            url: "/filter",
            views: {
              'menuContent' :{
                templateUrl: "templates/menu-filter.html",
                controller: "FilterCtrl"
              }
            }
          })
          .state('menu.activities', {
            url: "/activities",
            views: {
              'menuContent' :{
                templateUrl: "templates/menu-activities.html",
                controller: "ActivitiesCtrl"
              }
            }
          })
          .state('menu.activity', {
            url: "/activity/:activityId",
            views: {
              'menuContent' :{
                templateUrl: "templates/activity-detail.html",
                controller: "ActivityDetailCtrl"
              }
            }
          });


      // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/menu/activities');

});

