angular.module('AdminService', []).factory('adminService', ['$http', function($http) {

    return {
        addVolunteer : function(password, orgName, vol) {
            return $http({
                method: 'POST',
                url: '/admin/vol/' + password,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    orgName: orgName,
                    vol: vol
                }
            });
        },

        removeVolunteer : function(password, orgName, vol){
            return $http({
                method: 'DELETE',
                url: '/admin/vol/' + password,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    orgName: orgName,
                    vol: vol
                }
            });
        },

        addEvent : function(password, orgName, event){
            return $http({
                method: 'POST',
                url: '/admin/event/' + password,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    orgName: orgName,
                    event: event
                }
            });
        },

        removeEvent : function(password, orgName, event){
            return $http({
                method: 'DELETE',
                url: '/admin/event/' + password,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    orgName: orgName,
                    event: event
                }
            });
        }
    }

}]);