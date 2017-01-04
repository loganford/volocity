angular.module('RegistrationCtrl', ['angularMoment', 'RegistrationService']).controller('registrationController', registrationController)
    .factory('_', ['$window',
        function ($window) {
            return $window._;
        }
    ]);

registrationController.$inject = ['moment', '_', 'registrationService', '$scope', '$location', '$anchorScroll'];
function registrationController(moment, _, registrationService, $scope, $location, $anchorScroll) {
    var rc = this;
    rc.email = $scope.$parent.email;
    rc.passcode = $scope.$parent.passcode;
    rc.org = $scope.$parent.org;
    rc.vol = $scope.$parent.vol;
    rc.buttonText = 'Submit';
    rc.checkboxes = [];
    rc.err = 0;
// Iterate through the organization's events; generate checkboxes
    _.forEach(rc.org.events, function (event) {
        if (event.assignedVols === undefined) {
            var c = {};
            c.date = event.date;
            c.formattedDate = moment(c.date).format('MMMM Do');
            if (_.find(rc.vol.datesAvailable,
                    function (d) {
                        return d == event.date
                    }) !== undefined) {
                c.checked = true;
            } else {
                c.checked = false;
            }
            rc.checkboxes.push(c);
        }
    });

    rc.submit = function () {
        rc.working = true;
        rc.vol.datesAvailable = [];
        _.forEach(rc.checkboxes, function (c) {
            var i = _.findIndex(rc.org.events, function (e) {
                return e.date == c.date
            });
            if (c.checked == true) {
                rc.vol.datesAvailable.push(c.date);
                if (_.includes(rc.org.events[i].volsAvailable, rc.vol.email) == false) {
                    rc.org.events[i].volsAvailable.push(rc.vol.email);
                }
            } else {
                _.remove(rc.org.events[i].volsAvailable, function (v) {
                    return v == rc.vol.email
                });
            }
        });
        registrationService.update(rc.passcode, rc.org, rc.vol).then(function (resp) {
            rc.working = false;
            rc.successful = true;
            rc.err = 0;
            console.log(resp);
            $location.hash('top');
            $anchorScroll();
        }, function (err) {
            rc.working = false;
            rc.err = err.status;
            console.log(err);
            $location.hash('top');
            $anchorScroll();
        });
    }
}