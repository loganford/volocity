angular.module('LoginService', []).factory('loginService', ['$http', function($http) {

    return {
        login : function(email, password) {
            return $http({
                method: 'GET',
                url: '/vol/' + email + '/' + password,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
    }

}]);