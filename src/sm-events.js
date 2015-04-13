(function (angular) {
    "use strict";

	var module = angular.module('net.enzey.selection-manager.events', []);

	module.service('nzSelectionManagerEvents', function () {
		this.getSelectEvent = function() {
			return 'nzSelect'
		};
		this.getDeselectEvent = function() {
			return 'nzDeselect'
		};
		this.getSoftSelectEvent = function() {
			return 'nzSoftSelect'
		};
		this.getSoftDeselectEvent = function() {
			return 'nzSoftDeselect'
		};

	});

})(angular);
