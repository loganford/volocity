angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider

        .when('/', {
            templateUrl: 'views/login.html',
            controller: 'loginController as lc'
        })

        .when('/register', {
            templateUrl: 'views/registration.html',
            controller: 'registrationController as rc'
        })

        .when('/admin', {
            templateUrl: 'views/admin.html',
            controller: 'adminController as ac'
        });

    $locationProvider.html5Mode(true);

}]);