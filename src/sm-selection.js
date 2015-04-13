(function (angular) {
    "use strict";

	var module = angular.module('net.enzey.selection-manager.selection', [
		'net.enzey.selection-manager.events'
	]);

	module.service('nzSelectionClassApplier', function(nzSelectionManagerConfig, nzSelectionManagerEvents) {
		return {
			applySoftSelectionClass: function(selectionManagerCtrl, element, selectionObj, selectionClass) {
				if (!selectionClass) {selectionClass = nzSelectionManagerConfig.getSoftSelectionClass()}

				if (selectionManagerCtrl.getSoftSelection() === selectionObj) {
					element.addClass(selectionClass);
				} else {
					element.removeClass(selectionClass);
				}
			},
			applySelectionClass: function(selectionManagerCtrl, element, selectionObj, selectionClass) {
				if (!selectionClass) {selectionClass = nzSelectionManagerConfig.getSelectionClass()}

				if (selectionManagerCtrl.isSelected(selectionObj)) {
					element.addClass(selectionClass);
				} else {
					element.removeClass(selectionClass);
				}
			},
			addSoftSelectionEvents: function(scope, element, selectionObj, selectionClass) {
				if (!selectionClass) {selectionClass = nzSelectionManagerConfig.getSoftSelectionClass()}

				scope.$on(nzSelectionManagerEvents.getSoftSelectEvent(),  function(event, data) {
					if (data === selectionObj) {
						element.addClass(selectionClass);
					}
				});
				scope.$on(nzSelectionManagerEvents.getSoftDeselectEvent(),  function(event, data) {
					if (data === selectionObj) {
						element.removeClass(selectionClass);
					}
				});
			},
			addSelectionEvents: function(scope, element, selectionObj, selectionClass) {
				if (!selectionClass) {selectionClass = nzSelectionManagerConfig.getSelectionClass()}

				scope.$on(nzSelectionManagerEvents.getSelectEvent(),  function(event, data) {
					if (data === selectionObj) {
						element.addClass(selectionClass);
					}
				});
				scope.$on(nzSelectionManagerEvents.getDeselectEvent(),  function(event, data) {
					if (data === selectionObj) {
						element.removeClass(selectionClass);
					}
				});
			}
		};
	});

	module.directive('nzSelectionClass', function (nzSelectionClassApplier) {
		return {
			restrict: 'A',
			controller: function($scope) {
				return {};
			},
			require: ['nzSelectionClass', '^nzSelectionManager'],
			compile: function ($element, $attrs) {
				var directiveName = this.name;
				return {
					pre: function (scope, element, attrs, controllers) {
						var selectionClassCtrl = controllers[0];
						var selectionManagerCtrl = controllers[1];

					},
					post: function (scope, element, attrs, controllers) {
						var selectionClassCtrl = controllers[0];
						var selectionManagerCtrl = controllers[1];

						var selectionObj = selectionClassCtrl.selectionObj;
						nzSelectionClassApplier.applySelectionClass(selectionManagerCtrl, element, selectionObj, $attrs[directiveName]);
						nzSelectionClassApplier.addSelectionEvents(scope, element, selectionObj, $attrs[directiveName]);
					}
				}
			}
        };
	});

	module.directive('nzSoftSelectionClass', function (nzSelectionClassApplier) {
		return {
			restrict: 'A',
			controller: function($scope) {
				return {};
			},
			require: ['nzSoftSelectionClass', '^nzSelectionManager'],
			compile: function ($element, $attrs) {
				var directiveName = this.name;
				return {
					pre: function (scope, element, attrs, controllers) {
						var selectionClassCtrl = controllers[0];
						var selectionManagerCtrl = controllers[1];

					},
					post: function (scope, element, attrs, controllers) {
						var selectionClassCtrl = controllers[0];
						var selectionManagerCtrl = controllers[1];

						var selectionObj = selectionClassCtrl.selectionObj;
						nzSelectionClassApplier.applySoftSelectionClass(selectionManagerCtrl, element, selectionObj, $attrs[directiveName]);
						nzSelectionClassApplier.addSoftSelectionEvents(scope, element, selectionObj, $attrs[directiveName]);
					}
				}
			}
        };
	});

    module.directive('nzSelectable', function ($parse, nzSelectionClassApplier) {
        return {
			restrict: 'A',
			controller: function($scope) {
				var ctrl = this;

				this.getSelectionObject = function() {
					return ctrl.selectionObj;
				};

				// The return is needed to support Angular 1.2
				return this;
			},
			require: ['?^nzSelectionClass', '?^nzSoftSelectionClass', '^nzSelectionManager', 'nzSelectable'],
			compile: function ($element, $attrs) {
				var directiveName = this.name;
				var parsedModelAttr = $parse($attrs[directiveName]);
				return {
					pre: function (scope, element, attrs, controllers) {
						var selectionClassCtrl = controllers[0];
						var selectionSoftClassCtrl = controllers[1];
						var selectionManagerCtrl = controllers[2];
						var selectableCtrl = controllers[3];

						var selectableObj = parsedModelAttr(scope);
						selectableCtrl.selectionObj = selectableObj;

						if (selectionClassCtrl) {
							selectionClassCtrl.selectionObj = selectableObj;
						} else {
							nzSelectionClassApplier.applySelectionClass(selectionManagerCtrl, element, selectableObj);
							nzSelectionClassApplier.addSelectionEvents(scope, element, selectableObj);
						}

						if (selectionSoftClassCtrl) {
							selectionSoftClassCtrl.selectionObj = selectableObj;
						} else {
							nzSelectionClassApplier.applySoftSelectionClass(selectionManagerCtrl, element, selectableObj);
							nzSelectionClassApplier.addSoftSelectionEvents(scope, element, selectableObj);
						}

						element.on('click', function(event) {
							event.preventDefault();
							if (event.ctrlKey) {
								selectionManagerCtrl.addSelected(element[0], true);
							} else if (event.shiftKey) {
								selectionManagerCtrl.rangeSelectFromLast(element[0]);
								event.preventDefault();
							} else {
								selectionManagerCtrl.clearSelection();
								selectionManagerCtrl.addSelected(element[0], false);
							}

							scope.$apply();
						});
					},
					post: function (scope, element, attrs) {
					}
				}
			}
        };
    });

})(angular);
