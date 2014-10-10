(function (angular) {
    "use strict";

	var onSelectionEvent = 'nzSelection';
	var onSelectEvent = 'nzSelect';
	var onDeselectEvent = 'nzDeselect';
	var directives = angular.module('net.enzey.selection-manager', []);

	directives.directive('nzSelectionClass', function ($parse) {
		return {
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

						var selectionClass = $attrs[directiveName];
						var selectionObj = selectionClassCtrl.selectionObj;
						var applyClass = function() {
							if (selectionManagerCtrl.isSelected(selectionObj)) {
								element.addClass(selectionClass);
							} else {
								element.removeClass(selectionClass);
							}
						};
						applyClass();
						scope.$on(onSelectEvent,  function(event, data) {
							if (data === selectionObj) {
								element.addClass(selectionClass);
							}
						});
						scope.$on(onDeselectEvent,  function(event, data) {
							if (data === selectionObj) {
								element.removeClass(selectionClass);
							}
						});
					}
				}
			}
        };
	});

    directives.directive('nzSelectable', function ($parse) {
        return {
			require: ['?^nzSelectionClass', '^nzSelectionManager', '?^ngRepeat'],
			compile: function ($element, $attrs) {
				var directiveName = this.name;
				var parsedModelAttr = $parse($attrs[directiveName]);
				return {
					pre: function (scope, element, attrs, controllers) {
						var selectionClassCtrl = controllers[0];
						var selectionManagerCtrl = controllers[1];

						var selectableObj = parsedModelAttr(scope);
						if (selectionClassCtrl) {
							selectionClassCtrl.selectionObj = selectableObj;
						}

						element.on('click', function(event) {
							if (event.ctrlKey) {
								selectionManagerCtrl.toggleSelect(selectableObj);
							} else {
								selectionManagerCtrl.setSelection(selectableObj);
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

    directives.directive('nzSelectionManager', function ($parse, $document, $timeout) {
        return {
			require: 'nzSelectionManager',
			controller: function($scope) {
				var selectionManagerCtrl;
				selectionManagerCtrl = {
					scope: $scope,
					isSelected: function(selected) {
						if (selectionManagerCtrl.isMultiSelect) {
							return selectionManagerCtrl.getSelection().indexOf(selected) > -1;
						} else {
							return selectionManagerCtrl.getSelection() === selected;
						}
					},
					setSelection: function(selected) {
						var currentSelections = selectionManagerCtrl.getSelection();
						if (selectionManagerCtrl.isMultiSelect) {
							currentSelections.length = 0;
							currentSelections.push(selected);
						} else {
							currentSelections = selected;
						}
						selectionManagerCtrl.updateSelectionModel(currentSelections);
					},
					toggleSelect: function(selected) {
						var currentSelections = selectionManagerCtrl.getSelection();
						if (selectionManagerCtrl.isMultiSelect) {
							var indexOfData = currentSelections.indexOf(selected);
							if (indexOfData === -1) {
								currentSelections.push(selected);
							} else {
								currentSelections.splice(indexOfData,1);
							}
						} else {
							var selectionValue;
							if (currentSelections === selectableObj) {
								currentSelections = undefined;
							}
						}
						selectionManagerCtrl.updateSelectionModel(currentSelections);
					}
				};
				return selectionManagerCtrl;
			},
			compile: function ($element, $attrs) {
				var directiveName = this.name;
				var modelLocation = $attrs[directiveName];
				var parsedModelAttr = $parse(modelLocation);
				var isMultiSelect = angular.isDefined($attrs.nzMultiSelect);
				return {
					pre: function (scope, element, attrs, selectionManagerCtrl) {
						selectionManagerCtrl.isMultiSelect = isMultiSelect;
						selectionManagerCtrl.getSelection = function() {
							var selection = parsedModelAttr(scope);
							if (selectionManagerCtrl.isMultiSelect && !selection) {
								selection = [];
							}
							return selection;
						};
						selectionManagerCtrl.updateSelectionModel = function(value) {
							parsedModelAttr.assign(scope, value);
						};
					},
					post: function (scope, element, attrs, selectionManagerCtrl) {
						if (selectionManagerCtrl.isMultiSelect) {
							scope.$watchCollection(modelLocation, function(newArray, oldArray) {
								if (!newArray) {newArray = [];}
								if (!oldArray) {oldArray = [];}

								var oldArrayIndex = oldArray.length;
								while(oldArrayIndex--) {
									var oldItem = oldArray[oldArrayIndex];
									if (newArray.indexOf(oldItem) === -1) {
										scope.$broadcast(onDeselectEvent, oldItem);
									}
								}

								var newArrayIndex = newArray.length;
								while(newArrayIndex--) {
									var newItem = newArray[newArrayIndex];
									if (oldArray.indexOf(newItem) === -1) {
										scope.$broadcast(onSelectEvent, newItem);
									}
								}
							});
						} else {
							scope.$watch(modelLocation, function(newVal, oldVal) {
								scope.$broadcast(onDeselectEvent, oldVal);
								scope.$broadcast(onSelectEvent, newVal);
							});
						}
					}
				}

			}
        };
    });

})(angular);
