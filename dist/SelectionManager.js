(function (angular) {
    "use strict";

	var trackSelectionEvent = 'nzTrackSelection';
	var onSelectEvent = 'nzSelect';
	var onDeselectEvent = 'nzDeselect';
	var module = angular.module('net.enzey.selection-manager', []);

	module.provider('nzSelectionManagerConfig', function () {
		var selectionClass = null;

		this.setSelectionClass = function(_selectionClass) {
			selectionClass = _selectionClass;
		};

		this.$get = function($log) {
			return {
				getSelectionClass: function() {
					return selectionClass;
				}
			};
		};
	});

	module.directive('nzSelectionClass', function (nzSelectionManagerConfig) {
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
						if (!selectionClass) {
							selectionClass = nzSelectionManagerConfig.getSelectionClass();
						}
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

    module.directive('nzSelectable', function ($parse) {
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

						selectionManagerCtrl.addSelectable(element, selectableObj);
						element.on('click', function(event) {
							event.preventDefault();
							event.stopPropagation();
							if (event.ctrlKey) {
								selectionManagerCtrl.toggleSelect(element);
							} else if (event.shiftKey) {
								selectionManagerCtrl.selectRangeFromLast(element);
								event.preventDefault();
							} else {
								selectionManagerCtrl.clearSelection();
								selectionManagerCtrl.setSelected(element);
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

    module.directive('nzSelectionManager', function ($parse, $document, $timeout) {
        return {
			require: 'nzSelectionManager',
			controller: function($scope) {
				var selectionManagerCtrl;
				selectionManagerCtrl = {
					scope: $scope,
					allSelectableElements: [],
					allSelectables: [],
					addSelectable: function(element, selectable) {
						selectionManagerCtrl.allSelectableElements.push(element);
						selectionManagerCtrl.allSelectables.push(selectable);
					},
					isSelected: function(selected) {
						if (selectionManagerCtrl.isMultiSelect) {
							return selectionManagerCtrl.getSelection().indexOf(selected) > -1;
						} else {
							return selectionManagerCtrl.getSelection() === selected;
						}
					},
					setSelected: function(selectedElement) {
						selectionManagerCtrl.lastSelectedIndex = selectionManagerCtrl.allSelectableElements.indexOf(selectedElement);
						var selectedObj = selectionManagerCtrl.allSelectables[selectionManagerCtrl.lastSelectedIndex];
						var currentSelections = selectionManagerCtrl.getSelection();
						if (selectionManagerCtrl.isMultiSelect) {
							currentSelections.push(selectedObj);
						} else {
							currentSelections = selectedObj;
						}
						selectionManagerCtrl.updateSelectionModel(currentSelections);
					},
					toggleSelect: function(selectedElement) {
						selectionManagerCtrl.lastSelectedIndex = selectionManagerCtrl.allSelectableElements.indexOf(selectedElement);
						var selectedObj = selectionManagerCtrl.allSelectables[selectionManagerCtrl.lastSelectedIndex];
						var currentSelections = selectionManagerCtrl.getSelection();
						if (selectionManagerCtrl.isMultiSelect) {
							var indexOfData = currentSelections.indexOf(selectedObj);
							if (indexOfData === -1) {
								currentSelections.push(selectedObj);
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
					},
					selectRangeFromLast: function(selectedElement) {
						if (selectionManagerCtrl.isMultiSelect && selectionManagerCtrl.lastSelectedIndex !== undefined && selectionManagerCtrl.lastSelectedIndex !== null) {
							var selectedIndex = selectionManagerCtrl.lastSelectedIndex;
							var currectSelectedIndex = selectionManagerCtrl.allSelectableElements.indexOf(selectedElement);

							selectionManagerCtrl.clearSelection();
							var selectedSpan = selectionManagerCtrl.allSelectableElements.slice(Math.min(selectionManagerCtrl.lastSelectedIndex, currectSelectedIndex), Math.max(selectionManagerCtrl.lastSelectedIndex, currectSelectedIndex) + 1);
							selectedSpan.forEach(function(selected) {
								selectionManagerCtrl.setSelected(selected);
							});
							selectionManagerCtrl.lastSelectedIndex = selectedIndex;
						} else {
							selectionManagerCtrl.setSelected(selectedElement);
						}
					},
					clearSelection: function() {
						selectionManagerCtrl.getSelection().length = 0;
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
