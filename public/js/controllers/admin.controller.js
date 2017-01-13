angular.module('AdminCtrl', ['angularMoment', 'AdminService']).controller('adminController', adminController)
    .factory('_', ['$window',
        function ($window) {
            return $window._;
        }
    ]);

adminController.$inject = ['moment', '_', 'adminService', '$scope', '$location', '$anchorScroll'];
function adminController(moment, _, adminService, $scope, $location, $anchorScroll) {
    var ac = this;
    ac.email = $scope.$parent.email;
    ac.password = $scope.$parent.password;
    ac.org = $scope.$parent.org;
    ac.preferences = ac.org.preferences;
    ac.vol = $scope.$parent.vol;
    ac.err = 0;
    ac.tableDates = [];
    ac.message = {};
    _.forEach(ac.org.events, function(e){
       ac.tableDates.push(moment(e.date).format('M/D'));
    });
    $scope.$parent.instruction = 'Administrator Page';

    ac.getIcon = function(volunteer, event){
        if(_.includes(event.assignedVols, volunteer)) {
            return 'A';
        } else if(_.includes(event.volsAvailable, volunteer)) {
            return 'Y';
        }
        return '';
    };

    ac.addVolunteer = function(){
        if(validEmail(ac.newVolunteer)) {
            ac.invalidNewEmail = false;
            $('#newVolModal').modal('hide');
            prepareForRequest();
            adminService.addVolunteer(ac.password, ac.org.name, ac.newVolunteer).then(function (resp) {
                ac.message.detail = 'Added ' + ac.newVolunteer + ' to ' + ac.org.name +'.';
                ac.org = resp.data[0];
                ac.newVolunteer = '';
                handleResp(resp);
            }, function (err) {
                handleErr(err);
            });
        } else {
            ac.invalidNewEmail = true;
        }
    };

    ac.removeVolunteer = function() {
        $('#removeVolModal').modal('hide');
        prepareForRequest();
        adminService.removeVolunteer(ac.password, ac.org.name, ac.volToRemove).then(function (resp){
            ac.message.detail = 'Removed ' + ac.volToRemove + ' from ' + ac.org.name + '.';
            ac.org = resp.data[0];
            handleResp(resp);
        }, function (err){
            handleErr(err);
        });
    };

    ac.addEvent = function(){
        if(moment(ac.newEvent).isValid()) {
            $('#newEventModal').modal('hide');
            prepareForRequest();
            adminService.addEvent(ac.password, ac.org.name, ac.newEvent).then(function (resp) {
                ac.message.detail = 'Added ' + moment(ac.newEvent).format('MMMM D, YYYY') + ' to ' + ac.org.name +'.';
                ac.org = resp.data[0];
                handleResp(resp);
                updateTableDates();
            }, function (err) {
                handleErr(err);
            });
        } else {
            ac.invalidDate = true;
        }
    };

    ac.removeEvent = function() {
        $('#removeEventModal').modal('hide');
        prepareForRequest();
        adminService.removeEvent(ac.password, ac.org.name, ac.eventToRemove).then(function (resp){
            ac.message.detail = 'Removed ' + moment(ac.eventToRemove).format('MMMM D, YYYY') + ' from events.';
            ac.org = resp.data[0];
            handleResp(resp);
            updateTableDates();
        }, function (err){
            handleErr(err);
        });
    };

    ac.changeAdminEmail = function(){
        if (validEmail(ac.newAdminEmail)) {
            $('#adminEmailModal').modal('hide');
            prepareForRequest()
            ac.invalidEmail = false;
            adminService.updateAdminEmail(ac.password, ac.org.name, ac.newAdminEmail).then(function(resp){
                ac.message.detail = 'The admin e-mail has been changed to ' + ac.newAdminEmail + '.';
                handleResp(resp);
            }, function (err){
                handleErr(err);
            })
        } else {
            ac.invalidEmail = true;
        }
    };

    ac.changeAdminPassword = function(){
        ac.invalidPassword = false;
        ac.invalidConfirmPassword = false;
        if (ac.newAdminPassword != '' && ac.newAdminPassword != ac.password) {
            if (ac.newAdminPassword == ac.confirmNewAdminPassword) {
                $('#adminPasswordModal').modal('hide');
                prepareForRequest();
                adminService.updatePassword(ac.password, ac.org.name, ac.newAdminPassword, 'Admin').then(function (resp) {
                    ac.message.detail = 'The admin password has been successfully updated.';
                    handleResp(resp);
                }, function (err) {
                    handleErr(err);
                })
            } else {
                ac.invalidConfirmPassword = true;
            }
        } else {
            ac.invalidPassword = true;
        }
    };

    ac.changeVolPassword = function(){
        ac.invalidPassword = false;
        ac.invalidConfirmPassword = false;
        if (ac.newVolPassword != '') {
            if (ac.newVolPassword == ac.confirmNewVolPassword) {
                $('#volPasswordModal').modal('hide');
                prepareForRequest();
                adminService.updatePassword(ac.password, ac.org.name, ac.newVolPassword, 'Volunteer').then(function (resp) {
                    ac.message.detail = 'The volunteer password has been successfully updated.';
                    handleResp(resp);
                }, function (err) {
                    handleErr(err);
                })
            } else {
                ac.invalidConfirmPassword = true;
            }
        } else {
            ac.invalidPassword = true;
        }
    };

    ac.updatePreference = function(){
        prepareForRequest();
        adminService.updatePreference(ac.password, ac.org.name, 'autoEmail', ac.preferences.autoEmail).then(function(resp){
            handleResp(resp);
            ac.message.detail = 'Your preferences have been updated.';
        }, function(err){
           handleErr(err);
        });
    };

    // Helper Methods
    ac.prettyDate = function(e) {
        return moment(e.date).format('MMMM D, YYYY');
    };

    ac.getCountdown = function(e) {
        return moment(e.date).diff(moment(), 'days');
    };

    function prepareForRequest() {
        ac.working = true;
        ac.err = 0;
        ac.message = {};
    }

    function handleResp(resp){
        ac.message.title = 'Success!';
        console.log(resp);
        ac.working = false;
        ac.err = 0;
    }

    function handleErr(err){
        console.log(err);
        ac.working = false;
        ac.err = err.status;
    }

    function updateTableDates(){
        ac.tableDates = [];
        _.forEach(ac.org.events, function(e){
            ac.tableDates.push(moment(e.date).format('M/D'));
        });
    }

    function validEmail(email){
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
}