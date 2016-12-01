angular.module('volocityApp', [])
	.controller('volocityController', function() {
		var volocity = this;
		volocity.events = [
			"January 30", "February 17", "March 3", "April 10"
		]
		volocity.printDate = function() {
			var date = "20170128";
			console.log(date);
			console.log('howdy');
		}
	});