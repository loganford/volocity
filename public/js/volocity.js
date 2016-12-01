angular.module('volocityApp', ['angularMoment'])
	.controller('volocityController', ['moment', function(moment) {
		var volocity = this;
		volocity.instruction = "Please enter your e-mail and the passcode:";
		volocity.page = 0;
		volocity.buttonText = "Enter";

		volocity.events = [
			"January 30", "February 17", "March 3", "April 10"
		]
		volocity.printDate = function() {
			var date = "20170128";
			console.log(date);
		}
		volocity.enter = function() {
			//Auth demo
			if(volocity.passcode == "PAVOLS2016") {
				volocity.page = 1;
				volocity.instruction = "Select which dates you are available to volunteer!";
				volocity.buttonText = "Submit";
				console.log(moment())
			} else {
				alert("Incorrect you diabetic.")
			}
		}
	}]);