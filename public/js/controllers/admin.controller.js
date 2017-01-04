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
    ac.passcode = $scope.$parent.passcode;
    ac.org = $scope.$parent.org;
    ac.vol = $scope.$parent.vol;
    ac.err = 0;
    $scope.$parent.instruction = 'Welcome back, administrator.';
}