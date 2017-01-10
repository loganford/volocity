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
        },

        updateAdminEmail : function(password, orgName, newAdminEmail) {
            return $http({
                method: 'PUT',
                url: '/admin/email/' + password,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    orgName: orgName,
                    newAdminEmail: newAdminEmail
                }
            });
        },

        updatePassword: function(password, orgName, newPassword, roleToChange) {
            return $http({
                method: 'PUT',
                url: '/admin/password/' + password,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    orgName: orgName,
                    newPassword: newPassword,
                    roleToChange: roleToChange
                }
            });
        },

        updatePreference: function(password, orgName, preference, value){
            return $http({
                method: 'PUT',
                url: '/admin/pref/' + password,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    orgName: orgName,
                    pref: preference,
                    value: value
                }
            });
        }
    }

}]);