angular.module('MainCtrl', []).controller('mainController', mainController);

mainController.$inject = ['$scope'];
function mainController($scope){
    $scope.instruction = 'Please enter your e-mail and the password:';
}