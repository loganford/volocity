angular.module('volocityApp', ['angularMoment'])
	.factory('_', ['$window',
		function($window) {
			return $window._;
		}
	])
	.controller('volocityController', ['moment', '_', '$http', function(moment, _, $http) {
		var volocity = this;
		volocity.instruction = "Please enter your e-mail and the passcode:";
		volocity.page = 0;
		volocity.buttonText = "Enter";

		volocity.enter = function() {
			//Auth demo
			volocity.email = _.toLower(volocity.email);
			$http({
				method: 'GET',
				url: '/vol/' + volocity.email + '/' + volocity.passcode,
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(function(resp){
				console.log(resp.data);
			}, function(err){
				console.log(err);
			})
		}
	}]);