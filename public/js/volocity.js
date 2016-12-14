angular.module('volocityApp', ['angularMoment'])
	.factory('_', ['$window',
		function($window) {
			return $window._;
		}
	])
	.controller('volocityController', ['moment', '_', '$http', function(moment, _, $http) {
		var vc = this;
		vc.instruction = "Please enter your e-mail and the passcode:";
		vc.page = 0;
		vc.buttonText = "Enter";
		vc.checkboxes = [];
		vc.checkMe = true;
		vc.err = 0;
		vc.enter = function() {
			vc.email = _.toLower(vc.email);
			if (vc.page == 1){
				vc.submit();
			} else {
				$http({
					method: 'GET',
					url: '/vol/' + vc.email + '/' + vc.passcode,
					headers: {
						'Content-Type': 'application/json'
					}
				}).then(function (resp) {
					console.log(resp.data);
					if (resp.data == "") {
						//User doesn't exist
					} else {
						vc.page = 1;
						vc.instruction = "Please select dates you are available to volunteer!";
						vc.buttonText = "Submit";
						vc.org = resp.data.org;
						vc.vol = resp.data.vol;
						// Iterate through the organization's events; generate checkboxes
						_.forEach(vc.org.events, function(event) {
							var c = {};
							c.date = event.date;
							c.formattedDate = moment(c.date).format('MMMM Do');
							if (_.find(vc.vol.datesAvailable,
									function (d) {return d == event.date}) !== undefined) {
								c.checked = true;
							} else {
								c.checked = false;
							}
							vc.checkboxes.push(c);
						});
					}
				}, function (err) {
					console.log(err.status);
					vc.err = err.status;
				});
			}
		}

		vc.submit = function() {
			vc.vol.datesAvailable = [];
			_.forEach(vc.checkboxes, function(c){
				var i = _.findIndex(vc.org.events, function(e) {return e.date == c.date});
				if(c.checked == true) {
					vc.vol.datesAvailable.push(c.date);
					if(_.includes(vc.org.events[i].volsAvailable, vc.vol.email) == false) {
						vc.org.events[i].volsAvailable.push(vc.vol.email);
					}
				} else {
						_.remove(vc.org.events[i].volsAvailable, function(v) {return v == vc.vol.email});
				}
			});
			$http({
				method: 'PUT',
				url: '/vol/' + vc.passcode,
				headers: {
					'Content-Type': 'application/json'
				},
				data: {
					org: vc.org,
					vol: vc.vol
				}
			}).then(function (resp) {
				if (resp.data == "") {
					//User doesn't exist
				} else {
					console.log(resp);
				}
			}, function (err) {
				console.log(err);
			});
		}
	}]);