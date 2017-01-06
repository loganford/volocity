angular.module('RegistrationService', []).factory('registrationService', ['$http', function($http) {

    return {
        update : function(password, org, vol) {
            return $http({
                method: 'PUT',
                url: '/vol/' + password,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    org: org,
                    vol: vol
                }
            })
        }
    }

}]);