angular.module('LoginCtrl', ['angularMoment', 'LoginService']).controller('loginController', loginController)
    .factory('_', ['$window',
    function ($window) {
        return $window._;
    }
]);

loginController.$inject = ['_', 'loginService', '$scope', '$location'];
function loginController(_, loginService, $scope, $location) {

    var lc = this;
    lc.buttonText = 'Enter';
    lc.err = 0;

    lc.enter = function () {
        lc.email = _.toLower(lc.email);
        // Pass email and password to main controller
        $scope.$parent.email = lc.email;
        $scope.$parent.password = lc.password;
        lc.working = true;
        loginService.login(lc.email, lc.password).then(function (resp) {
            lc.err = 0;
            $scope.$parent.instruction = "Please select dates you are available to volunteer!";
            $scope.$parent.org = resp.data.org;
            $scope.$parent.vol = resp.data.vol;
            lc.working = false;
            if (resp.data.admin) {
                $location.path('/admin');
            } else {
                $location.path('/register');
            }
        }, function (err) {
            lc.working = false;
            lc.err = err.status;
            console.log(err);
        });
    }
};