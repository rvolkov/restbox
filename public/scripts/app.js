'use strict';
var restBox = angular.module('restBox', [
  'ngRoute',
  'ngResource',
  'restBox.controllers',
  'restBox.services'
]);
restBox.config(['$routeProvider','$locationProvider',function ($routeProvider,$locationProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl',
    access: { requiredLogin: false }
  })
  .when('/restbox', {
    templateUrl: 'views/restbox.html',
    controller: 'MainCtrl',
    access: { requiredLogin: true }
  })
  .when('/restboxedit', {
    templateUrl: 'views/restboxedit.html',
    controller: 'EditCtrl',
    access: { requiredLogin: true }
  })
  .otherwise({
    redirectTo: '/'
  });
  //$locationProvider.html5Mode(true);
}])
.factory('TokenInterceptor', ['$q','$window','$location','AuthenticationService', function ($q, $window, $location, AuthenticationService) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
            }
            return config;
        },
        requestError: function(rejection) {
            return $q.reject(rejection);
        },
        // Set Authentication.isAuthenticated to true if 200 received
        response: function (response) {
            if (response != null && response.status == 200 && $window.sessionStorage.token && !AuthenticationService.isAuthenticated) {
                AuthenticationService.isAuthenticated = true;
            }
            return response || $q.when(response);
        },
        // Revoke client authentication if 401 is received
        responseError: function(rejection) {
            if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || AuthenticationService.isAuthenticated)) {
                delete $window.sessionStorage.token;
                AuthenticationService.isAuthenticated = false;
                $location.path("/");
            }
            return $q.reject(rejection);
        }
    };
}])
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('TokenInterceptor');
})
.run(function($rootScope, $location, AuthenticationService) {
  $rootScope.$on('$routeChangeStart', function(event, nextRoute) {
    if(nextRoute.access.requiredLogin && !AuthenticationService.isLogged && !$window.sessionStorage.token) {
      $location.path('/');
    }
  });
});
