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
    ac.vol = $scope.$parent.vol;
    ac.err = 0;
    ac.tableDates = [];
    ac.message = {}
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
    }

    ac.addVolunteer = function(){
        if(validEmail(ac.newVolunteer)) {
            ac.invalidNewEmail = false;
            $('#newVolModal').modal('hide');
            ac.err = 0;
            ac.message = {};
            ac.working = true;
            adminService.addVolunteer(ac.password, ac.org.name, ac.newVolunteer).then(function (resp) {
                ac.err = 0;
                ac.message.title = 'Success!';
                ac.message.detail = 'Added ' + ac.newVolunteer + ' to ' + ac.org.name +'.';
                ac.org = resp.data[0];
                console.log(resp);
                ac.working = false;
                ac.newVolunteer = '';
            }, function (err) {
                ac.err = err.status;
                console.log(err);
                ac.working = false;
            });
        } else {
            ac.invalidNewEmail = true;
        }
    }

    ac.removeVolunteer = function() {
        $('#removeVolModal').modal('hide');
        ac.working = true;
        ac.err = 0;
        ac.message = {};
        adminService.removeVolunteer(ac.password, ac.org.name, ac.volToRemove).then(function (resp){
            ac.message.title = 'Success!';
            ac.message.detail = 'Removed ' + ac.volToRemove + ' from ' + ac.org.name + '.';
            ac.org = resp.data[0];
            console.log(resp);
            ac.working = false;
        }, function (err){
            ac.err = err.status;
            console.log(err);
            ac.working = false;
        });
    }

    ac.addEvent = function(){
        if(moment(ac.newEvent).isValid()) {
            ac.invalidNewEmail = false;
            $('#newEventModal').modal('hide');
            ac.err = 0;
            ac.message = {};
            ac.working = true;
            adminService.addEvent(ac.password, ac.org.name, ac.newEvent).then(function (resp) {
                ac.err = 0;
                ac.message.title = 'Success!';
                ac.message.detail = 'Added ' + moment(ac.newEvent).format('MMMM D, YYYY') + ' to ' + ac.org.name +'.';
                ac.org = resp.data[0];
                console.log(resp);
                ac.working = false;
                updateTableDates();
            }, function (err) {
                ac.err = err.status;
                console.log(err);
                ac.working = false;
            });
        } else {
            ac.invalidDate = true;
        }
    }

    ac.removeEvent = function() {
        $('#removeEventModal').modal('hide');
        ac.working = true;
        ac.err = 0;
        ac.message = {};
        adminService.removeEvent(ac.password, ac.org.name, ac.eventToRemove).then(function (resp){
            ac.message.title = 'Success!';
            ac.message.detail = 'Removed ' + moment(ac.eventToRemove).format('MMMM D, YYYY') + ' from events.';
            ac.org = resp.data[0];
            console.log(resp);
            ac.working = false;
            updateTableDates();
        }, function (err){
            ac.err = err.status;
            console.log(err);
            ac.working = false;
        });
    }

    // Helper Methods
    ac.prettyDate = function(e) {
        return moment(e.date).format('MMMM D, YYYY');
    }

    ac.getCountdown = function(e) {
        return moment(e.date).diff(moment(), 'days');
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