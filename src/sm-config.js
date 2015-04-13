(function (angular) {
    "use strict";

	var module = angular.module('net.enzey.selection-manager.config', []);

	module.provider('nzSelectionManagerConfig', function () {
		var selectionClass = null;
		var softSelectionClass = null;

		this.setSelectionClass = function(_selectionClass) {
			selectionClass = _selectionClass;
		};
		this.setSoftSelectionClass = function(_selectionClass) {
			softSelectionClass = _selectionClass;
		};

		this.$get = function() {
			return {
				getSelectionClass: function() {
					return selectionClass;
				},
				getSoftSelectionClass: function() {
					return softSelectionClass;
				}
			};
		};
	});

})(angular);
