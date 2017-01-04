angular.module('LoginService', []).factory('loginService', ['$http', function($http) {

    return {
        login : function(email, passcode) {
            return $http({
                method: 'GET',
                url: '/vol/' + email + '/' + passcode,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
    }

}]);