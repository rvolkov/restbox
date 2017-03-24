'use strict';
var controllers;
controllers = angular.module('restBox.controllers', []);
function getapiroot($location) {
  var lhost = $location.host();
  var lport = $location.port();
  return 'http://'+lhost+':'+lport;
}
function urlBase64Decode(str) {
  var output = str.replace('-', '+').replace('_', '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw 'Illegal base64url string!';
  }
  return window.atob(output); //polifyll https://github.com/davidchambers/Base64.js
}
///////// controllers ///////////
controllers.controller('VoidCtrl',['$scope',
    function($scope) {
      // this is only for testing
      $scope.testThings = [
        'TEST1'
      ];
    }
  ]
)
.controller('LoginCtrl', ['$scope','$location','$window','AuthenticationService','$http',
    '$routeParams',function($scope,$location,$window,AuthenticationService,$http,$routeParams) {
        $scope.apiroot = getapiroot($location);
        $scope.user = {username:'',password:'',submit:''};
        $scope.error = '';
        $scope.submit = function () {
        if($scope.user.username !== undefined && $scope.user.password !== undefined) {
            $http.post(getapiroot($location) + '/login', $scope.user)
            .then(function onSuccess(response) {
                var data = response.data;
                var encodedProfile = data.token.split('.')[1];
                var profile = JSON.parse(urlBase64Decode(encodedProfile));
                $scope.profile = profile;
                if(profile.login === $scope.user.username) {
                    AuthenticationService.isLogged = true;
                    AuthenticationService.login = $scope.user.username;
                    AuthenticationService.token = data.token;
                    $window.sessionStorage.token = data.token;
                    $window.sessionStorage.login = $scope.user.username;
                    $scope.error = '';
                    $location.path('/restbox');
                } else {
                    $scope.error = 'Error: Invalid user received from token';
                    AuthenticationService.isLogged = false;
                    delete $window.sessionStorage.token;
                    delete $window.sessionStorage.login;
                }
            })
            .catch(function onError(data) {
                AuthenticationService.isLogged = false;
                $scope.error = 'Error: Invalid user or password';
            });
        }
    };
    // this is only for testing
    $scope.testThings = [
      'TE1',
      'TE2',
      'TE3'
    ];
}])
.controller('MainCtrl',['$scope', '$http', '$location', '$window', 'AuthenticationService', '$interpolate', '$sce', '$compile', '$interval', function($scope, $http, $location, $window, AuthenticationService, $interpolate, $sce, $compile, $interval) {
    $scope.user = {username:'username',password:'password',submit:''};
    $scope.apiroot = getapiroot($location);
    $scope.error = '';
    $scope.user.username = AuthenticationService.login;
    $scope.boxctrls = [];
    // this is only for testing
    $scope.testThings = [
      'TEST1',
      'TEST2',
      'TEST3',
      'TEST4'
    ];
    $scope.logout = function() {
        $scope.error = '';
        AuthenticationService.isLogged = false;
        delete $window.sessionStorage.token;
        $location.path('/');
    };
    $scope.editor = function() {
        $location.path('/restboxedit');
    };
    var number_of_failed_timeouts = 0;
    var error_detected = false;
    $scope.noserver = false;
    $scope.getBoxctrl = function() {
        $http.get(getapiroot($location) + '/webapi/list/boxcontrollers')
        .then(function onSuccess(response) {
            var data = response.data;
            $scope.boxctrls = JSON.parse(data.message);
            $scope.error = '';
            error_detected = false;
        });
    };
    $scope.getBoxctrl();
    $scope.getStatuses = function() {
        var b;
        for(var i=0; b=$scope.boxctrls[i]; i++) {
            var bb;
            for(var j=0; bb=b.boxes[j]; j++) {
                $http.get(getapiroot($location) + '/webapi/get/'+b.name+'/'+bb.type+'/'+bb.id)
                .then(function onSuccess(response) {
                    var data = response.data;
                    $scope.boxctrls[i].boxes[j].status = JSON.parse(data.message);
                    $scope.error = '';
                    error_detected = false;
                });
            }
        }
    };
    $scope.getStatus = function(bname,btype,bid) {
        var b;
        for(var i=0; b=$scope.boxctrls[i]; i++) {
            if(b.name === bname) {
                var bb;
                for(var j=0; bb=b.boxes[j]; j++) {
                    if(bb.type === btype && bb.id === bid) {
                        return $scope.boxctrls[i].boxes[j].status;
                    }
                }
            }
        }
        return 0;
    };
    $scope.putBoxctrl = function(boxn,btype,bid,bval) {
        $http.put(getapiroot($location) + '/webapi/change/'+boxn+'/'+btype+'/'+bid+'/'+bval)
        .then(function onSuccess(response) {
            var data = response.data;
            $scope.error = '';
            error_detected = false;
        });
    };
    $scope.action_functions = '';
    $scope.getActionFunctions = function() {
        $http.get(getapiroot($location) + '/webapi/list/afunctions')
        .then(function onSuccess(response) {
            var data = response.data;
            $scope.action_functions = JSON.parse(data.message);
            $scope.error = '';
            error_detected = false;
        });
    };
    $scope.getActionFunctionDescr = function(name) {
        var b;
        for(var i=0; b=$scope.action_functions[i]; i++) {
           if(name === b.name) {
             return(b.descr);
           }
        }
        return('unknown');
    };
    $scope.getActionFunctions();
    $scope.putOnFunc = function(boxn,btype,bid,bval) {
        $http.put(getapiroot($location) + '/webapi/onfunc/'+boxn+'/'+btype+'/'+bid+'/'+bval)
        .then(function onSuccess(response) {
            var data = response.data;
            $scope.error = '';
            error_detected = false;
        });
    };
    $scope.putOffFunc = function(boxn,btype,bid,bval) {
        $http.put(getapiroot($location) + '/webapi/offfunc/'+boxn+'/'+btype+'/'+bid+'/'+bval)
        .then(function onSuccess(response) {
            var data = response.data;
            $scope.error = '';
            error_detected = false;
        });
    };
    $scope.reloadBox = function() {
        $scope.getBoxctrl();
    }
    $scope.call_afunc = function(name) {
        $http.put(getapiroot($location) + '/webapi/call/afunc/'+name)
        .then(function onSuccess(response) {
          $scope.error = '';
          error_detected = false;
        });
    };
    $scope.read_functions = '';
    $scope.getReadFunctions = function() {
        $http.get(getapiroot($location) + '/webapi/list/rfunctions')
        .then(function onSuccess(response) {
            var data = response.data;
            $scope.read_functions = JSON.parse(data.message);
            $scope.error = '';
            error_detected = false;
        });
    };
    $scope.getReadFunctions();
    $scope.putRFunc = function(boxn,btype,bid,bval) {
        $http.put(getapiroot($location) + '/webapi/rfunc/'+boxn+'/'+btype+'/'+bid+'/'+bval)
        .then(function onSuccess(response) {
            $scope.error = '';
            error_detected = false;
        });
    };
    $scope.routers = [];
    $scope.getRouters = function() {
        $http.get(getapiroot($location) + '/webapi/list/routers')
        .then(function onSuccess(response) {
            var data = response.data;
            $scope.routers = JSON.parse(data.message);
            $scope.error = '';
            error_detected = false;
        });
    };
    // force csr-aws re-auth
    $scope.forceCSRAuth = function() {
        $http.put(getapiroot($location) + '/webapi/csr/reauth')
        .then(function onSuccess(response) {
            var data = response.data;
            $scope.error = '';
            error_detected = false;
        });
    };
    var number_of_failed_timeouts = 0;
    var timer = $interval(function(){
        $scope.reloadBox();
        //$scope.getStatuses();
        //scanLEDs();
        if(error_detected) {
          number_of_failed_timeouts = number_of_failed_timeouts + 1;
        } else {
          number_of_failed_timeouts = 0;
        }
        error_detected = true;
        if(number_of_failed_timeouts > 2) { $scope.noserver = true; }
        if(number_of_failed_timeouts == 0) { $scope.noserver = false; }
    },4000);
  }
])
.controller('EditCtrl',['$scope', '$http', '$location', '$window', 'AuthenticationService', '$interpolate', '$sce', '$compile', '$interval', function($scope, $http, $location, $window, AuthenticationService, $interpolate, $sce, $compile, $interval) {
    $scope.user = {username:'username',password:'password',submit:''};
    $scope.apiroot = getapiroot($location);
    $scope.error = '';
    $scope.user.username = AuthenticationService.login;
    $scope.boxctrls = [];
    //$scope.staticboxctrls = [];
    //$scope.dboxctrls = [];
    // this is only for testing
    $scope.testThings = [
      'TEST1',
      'TEST2',
      'TEST3',
      'TEST4'
    ];
    $scope.back = function() {
        $location.path('/restbox');
    };
    //$scope.box = [];
    var number_of_failed_timeouts = 0;
    var error_detected = false;
    $scope.noserver = false;
    $scope.getBoxctrl = function() {
        $http.get(getapiroot($location) + '/webapi/list/boxcontrollers')
        .then(function onSuccess(response) {
            var data = response.data;
            $scope.boxctrls = JSON.parse(data.message);
            //for(var i=0; $scope.boxctrls[i];i++) {
            //    $scope.box[i] = $scope.boxctrls[i].name;
            //}
            $scope.error = '';
            error_detected = false;
        });
    };
    $scope.getBoxctrl();
    $scope.getStatuses = function() {
        var b;
        for(var i=0; b=$scope.boxctrls[i]; i++) {
            var bb;
            for(var j=0; bb=b.boxes[j]; j++) {
                $http.get(getapiroot($location) + '/webapi/get/'+b.name+'/'+bb.type+'/'+bb.id)
                .then(function onSuccess(response) {
                    var data = response.data;
                    $scope.boxctrls[i].boxes[j].status = JSON.parse(data.message);
                    $scope.error = '';
                    error_detected = false;
                });
            }
        }
    };
    $scope.getStatus = function(bname,btype,bid) {
        var b;
        for(var i=0; b=$scope.boxctrls[i]; i++) {
            if(b.name === bname) {
                var bb;
                for(var j=0; bb=b.boxes[j]; j++) {
                    if(bb.type === btype && bb.id === bid) {
                        return $scope.boxctrls[i].boxes[j].status;
                    }
                }
            }
        }
        return 0;
    };
    $scope.putBoxctrl = function(boxn,btype,bid,bval) {
        $http.put(getapiroot($location) + '/webapi/change/'+boxn+'/'+btype+'/'+bid+'/'+bval)
        .then(function onSuccess(response) {
            var data = response.data;
            $scope.error = '';
            error_detected = false;
        });
    };
    $scope.action_functions = '';
    $scope.getActionFunctions = function() {
        $http.get(getapiroot($location) + '/webapi/list/afunctions')
        .then(function onSuccess(response) {
            var data = response.data;
            $scope.action_functions = JSON.parse(data.message);
            $scope.error = '';
            error_detected = false;
        });
    };
    $scope.getActionFunctions();
    $scope.putOnFunc = function(boxn,btype,bid,bval) {
        $http.put(getapiroot($location) + '/webapi/onfunc/'+boxn+'/'+btype+'/'+bid+'/'+bval)
        .then(function onSuccess(response) {
            var data = response.data;
            $scope.error = '';
            error_detected = false;
        });
    };
    $scope.putOffFunc = function(boxn,btype,bid,bval) {
        $http.put(getapiroot($location) + '/webapi/offfunc/'+boxn+'/'+btype+'/'+bid+'/'+bval)
        .then(function onSuccess(response) {
            var data = response.data;
            $scope.error = '';
            error_detected = false;
        });
    };
    $scope.reloadBox = function() {
        $scope.getBoxctrl();
    }
    $scope.call_afunc = function(name) {
        $http.put(getapiroot($location) + '/webapi/call/afunc/'+name)
        .then(function onSuccess(response) {
        });
    };
    $scope.read_functions = '';
    $scope.getReadFunctions = function() {
        $http.get(getapiroot($location) + '/webapi/list/rfunctions')
        .then(function onSuccess(response) {
            var data = response.data;
            $scope.read_functions = JSON.parse(data.message);
            $scope.error = '';
            error_detected = false;
        });
    };
    $scope.getReadFunctions();
    $scope.putRFunc = function(boxn,btype,bid,bval) {
        $http.put(getapiroot($location) + '/webapi/rfunc/'+boxn+'/'+btype+'/'+bid+'/'+bval)
        .then(function onSuccess(response) {
            var data = response.data;
            $scope.error = '';
            error_detected = false;
        });
    };
    $scope.routers = [];
    $scope.getRouters = function() {
        $http.get(getapiroot($location) + '/webapi/list/routers')
        .then(function onSuccess(response) {
            var data = response.data;
            $scope.routers = JSON.parse(data.message);
            $scope.error = '';
            error_detected = false;
        });
    };
    var number_of_failed_timeouts = 0;
  }
]);
