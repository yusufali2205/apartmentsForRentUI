angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider



      .state('menu.search', {
    url: '/search',
    views: {
      'side-menu21': {
        templateUrl: 'templates/search.html',
        controller: 'searchCtrl'
      }
    }
  })

  .state('menu.shortlistedProperties', {
    url: '/savedProperties',
    views: {
      'side-menu21': {
        templateUrl: 'templates/shortlistedProperties.html',
        controller: 'shortlistedPropertiesCtrl',
        onEnter: function($rootScope) {
          if (!$rootScope.userLogged) {
            $state.go('menu.login');
          }
        }
      }
    }
  })

  .state('menu.listYourProperty', {
    url: '/listProperty',
    views: {
      'side-menu21': {
        templateUrl: 'templates/listYourProperty.html',
        controller: 'listYourPropertyCtrl'
      }
    }
  })

  .state('menu', {
    cache: false,
    url: '/side-menu21',
    templateUrl: 'templates/menu.html',
    abstract:true,
    controller: 'menuCtrl'
  })

  .state('menu.login', {
    url: '/login',
    views: {
      'side-menu21': {
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'
      }
    }
  })

  .state('menu.signup', {
    url: '/signup',
    views: {
      'side-menu21': {
        templateUrl: 'templates/signup.html',
        controller: 'signupCtrl'
      }
    }
  })

  .state('menu.manageListings', {
    cache: false,
    url: '/manageListings',
    views: {
      'side-menu21': {
        templateUrl: 'templates/manageListings.html',
        controller: 'manageListingsCtrl'
      }
    }
  })

  .state('menu.editPropertyDetails', {
    url: '/editPropertyDetails/:propertyId',
    cache: false,
    views: {
      'side-menu21': {
        templateUrl: 'templates/editPropertyDetails.html',
        controller: 'editPropertyDetailsCtrl'
      }
    }
  })

  .state('menu.settings', {
    cache: false,
    url: '/settings',
    views: {
      'side-menu21': {
        templateUrl: 'templates/settings.html',
        controller: 'settingsCtrl'
      }
    }
  })

    .state('menu.ownerDetails', {
      url: '/owner/:ownerId',
      views: {
        'side-menu21': {
          templateUrl: 'templates/owner.html',
          controller: 'ownerCtrl'
        }
      }
    })

    .state('menu.propertyDetails', {
      cache: false,
      url: '/propertyDetails/:propertyId',
      views: {
        'side-menu21': {
          templateUrl: 'templates/propertyDetails.html',
          controller: 'propertyDetailsCtrl'
        }
      }
    })

    .state('addPictures', {
      url: '/pictures',
      templateUrl: 'templates/addPictures.html',
      controller: 'addPicturesCtrl'
  })

  .state('menu.home', {
    url: '/home',
    views: {
      'side-menu21': {
        templateUrl: 'templates/home.html',
        controller: 'homeCtrl'
      }
    }
  });

$urlRouterProvider.otherwise('/side-menu21/home')



});
