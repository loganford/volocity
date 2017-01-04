angular.module('AdminService', []).factory('adminService', ['$http', function($http) {

    return {
        // update : function(passcode, org, vol) {
        //     return $http({
        //         method: 'PUT',
        //         url: '/vol/' + passcode,
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         data: {
        //             org: org,
        //             vol: vol
        //         }
        //     })
        // }
    }

}]);