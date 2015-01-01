(function (angular) {
    "use strict";

	var trackSelectionEvent = 'nzTrackSelection';
	var onSelectEvent = 'nzSelect';
	var onDeselectEvent = 'nzDeselect';
	var onSoftSelectEvent = 'nzSoftSelect';
	var onSoftDeselectEvent = 'nzSoftDeselect';
	var module = angular.module('net.enzey.selection-manager', []);

	module.provider('nzSelectionManagerConfig', function () {
		var selectionClass = null;

		this.setSelectionClass = function(_selectionClass) {
			selectionClass = _selectionClass;
		};

		this.$get = function() {
			return {
				getSelectionClass: function() {
					return selectionClass;
				}
			};
		};
	});

	module.directive('nzSelectionClass', ['nzSelectionManagerConfig', function (nzSelectionManagerConfig) {
		return {
			restrict: 'A',
			controller: ['$scope', function($scope) {
				return {};
			}],
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
	}]);

	module.directive('nzSoftSelectionClass', ['nzSelectionManagerConfig', function (nzSelectionManagerConfig) {
		return {
			restrict: 'A',
			controller: ['$scope', function($scope) {
				return {};
			}],
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

						var selectionClass = $attrs[directiveName];
						if (!selectionClass) {
							selectionClass = nzSelectionManagerConfig.getSoftSelectionClass();
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
						scope.$on(onSoftSelectEvent,  function(event, data) {
							if (data === selectionObj) {
								element.addClass(selectionClass);
							}
						});
						scope.$on(onSoftDeselectEvent,  function(event, data) {
							if (data === selectionObj) {
								element.removeClass(selectionClass);
							}
						});
					}
				}
			}
        };
	}]);

    module.directive('nzSelectable', ['$parse', function ($parse) {
        return {
			restrict: 'A',
			require: ['?^nzSelectionClass', '?^nzSoftSelectionClass', '^nzSelectionManager'],
			compile: function ($element, $attrs) {
				var directiveName = this.name;
				var parsedModelAttr = $parse($attrs[directiveName]);
				return {
					pre: function (scope, element, attrs, controllers) {
						var selectionClassCtrl = controllers[0];
						var selectionSoftClassCtrl = controllers[1];
						var selectionManagerCtrl = controllers[2];

						var selectableObj = parsedModelAttr(scope);
						if (selectionClassCtrl) {
							selectionClassCtrl.selectionObj = selectableObj;
						}
						if (selectionSoftClassCtrl) {
							selectionSoftClassCtrl.selectionObj = selectableObj;
						}

						selectionManagerCtrl.addSelectable(element[0], selectableObj);
						element.on('click', function(event) {
							event.preventDefault();
							event.stopPropagation();
							if (event.ctrlKey) {
								selectionManagerCtrl.toggleSelected(element[0]);
								selectionManagerCtrl.setSoftSelection(element[0]);
							} else if (event.shiftKey) {
								selectionManagerCtrl.selectRangeFromLast(element[0]);
								selectionManagerCtrl.setSoftSelection(element[0]);
								event.preventDefault();
							} else {
								selectionManagerCtrl.clearSelection();
								selectionManagerCtrl.addSelected(element[0]);
								selectionManagerCtrl.setSoftSelection(element[0]);
							}

							scope.$apply();
						});
					},
					post: function (scope, element, attrs) {
					}
				}
			}
        };
    }]);

    module.directive('nzSelectionManager', ['$parse', '$document', '$timeout', function ($parse, $document, $timeout) {
        return {
			restrict: 'A',
			require: 'nzSelectionManager',
			controller: ['$scope', '$timeout', function($scope, $timeout) {
				var selectionManagerCtrl;

				var updateSelection = function (value) {
					if (selectionManagerCtrl._locationOfSelection) {
						selectionManagerCtrl._locationOfSelection.assign($scope, value);
					} else {
						selectionManagerCtrl._selection = value;
					}
				};
				var updateSoftSelection = function (value) {
					if (selectionManagerCtrl._locationOfSoftSelection) {
						selectionManagerCtrl._locationOfSoftSelection.assign($scope, value);
					} else {
						selectionManagerCtrl._softSelection = value;
					}
				};

				selectionManagerCtrl = {
					scope: $scope,
					allSelectableElements: [],
					allSelectables: [],
					_locationOfSelection: null,
					_locationOfSoftSelection: null,
					getElementFromObj: function(selectionObj) {
						var selectedIndex = selectionManagerCtrl.allSelectables.indexOf(selectionObj);
						return selectionManagerCtrl.allSelectableElements[selectedIndex];
					},
					getSelection: function() {
						var selection = selectionManagerCtrl._selection;
						if (selectionManagerCtrl._locationOfSelection) {
							selection = selectionManagerCtrl._locationOfSelection($scope);
						}
						if (selectionManagerCtrl.isMultiSelect && !selection) {
							selection = [];
						}

						return selection;
					},
					getSoftSelection: function() {
						var softSelection = selectionManagerCtrl._softSelection;
						if (selectionManagerCtrl._locationOfSoftSelection) {
							softSelection = selectionManagerCtrl._locationOfSoftSelection($scope);
						}

						return softSelection;
					},
					setSoftSelection: function(selectedElement) {
						var selectedIndex = selectionManagerCtrl.allSelectableElements.indexOf(selectedElement);
						var selectedObj = selectionManagerCtrl.allSelectables[selectedIndex];
						updateSoftSelection(selectedObj);
					},
					addSelectable: function(element, selectable) {
						selectionManagerCtrl.allSelectableElements.push(element);
						selectionManagerCtrl.allSelectables.push(selectable);
					},
					isSelected: function(selectionObj) {
						if (selectionManagerCtrl.isMultiSelect) {
							return selectionManagerCtrl.getSelection().indexOf(selectionObj) > -1;
						} else {
							return selectionManagerCtrl.getSelection() === selectionObj;
						}
					},
					addSelected: function(selectedElement) {
						selectionManagerCtrl.lastSelectedElement = selectedElement;
						var selectedIndex = selectionManagerCtrl.allSelectableElements.indexOf(selectedElement);
						var selectedObj = selectionManagerCtrl.allSelectables[selectedIndex];
						var currentSelections = selectionManagerCtrl.getSelection();
						if (selectionManagerCtrl.isMultiSelect) {
							if (currentSelections.indexOf(selectedObj) === -1) {
								currentSelections.push(selectedObj);
							}
						} else {
							currentSelections = selectedObj;
						}
						updateSelection(currentSelections);
					},
					toggleSelected: function(selectedElement) {
						selectionManagerCtrl.lastSelectedElement = selectedElement;
						var selectedIndex = selectionManagerCtrl.allSelectableElements.indexOf(selectedElement);
						var selectedObj = selectionManagerCtrl.allSelectables[selectedIndex];
						var currentSelections = selectionManagerCtrl.getSelection();
						if (selectionManagerCtrl.isMultiSelect) {
							var indexOfData = currentSelections.indexOf(selectedObj);
							if (indexOfData === -1) {
								currentSelections.push(selectedObj);
							} else {
								currentSelections.splice(indexOfData,1);
							}
						} else {
							if (currentSelections === selectedObj) {
								currentSelections = undefined;
							} else {
								currentSelections = selectedObj;
							}
						}
						updateSelection(currentSelections);
					},
					selectRangeFromLast: function(selectedElement) {
						if (selectionManagerCtrl.isMultiSelect && selectionManagerCtrl.lastSelectedElement !== undefined && selectionManagerCtrl.lastSelectedElement !== null) {
							var lastSelectedElement = selectionManagerCtrl.lastSelectedElement;
							var lastSelectedIndex = selectionManagerCtrl.allSelectableElements.indexOf(lastSelectedElement);
							var currectSelectedIndex = selectionManagerCtrl.allSelectableElements.indexOf(selectedElement);

							selectionManagerCtrl.clearSelection();
							var selectedSpan = selectionManagerCtrl.allSelectableElements.slice(Math.min(lastSelectedIndex, currectSelectedIndex), Math.max(lastSelectedIndex, currectSelectedIndex) + 1);
							selectedSpan.forEach(function(selected) {
								selectionManagerCtrl.addSelected(selected);
							});
							selectionManagerCtrl.lastSelectedElement = lastSelectedElement;
						} else {
							selectionManagerCtrl.addSelected(selectedElement);
						}
					},
					getNextSelectableElement: function(currentElement) {
						var currentElementIndex = selectionManagerCtrl.allSelectableElements.indexOf(currentElement);
						currentElementIndex++;
						if (currentElementIndex >= selectionManagerCtrl.allSelectableElements.length) {
							currentElementIndex = 0;
						}

						return selectionManagerCtrl.allSelectableElements[currentElementIndex];
					},
					getPreviousSelectableElement: function(currentElement) {
						var currentElementIndex = selectionManagerCtrl.allSelectableElements.indexOf(currentElement);
						currentElementIndex--;
						if (currentElementIndex < 0) {
							currentElementIndex = selectionManagerCtrl.allSelectableElements.length - 1;
						}

						return selectionManagerCtrl.allSelectableElements[currentElementIndex];
					},
					clearSelection: function() {
						var selection = selectionManagerCtrl.getSelection();
						if (angular.isArray(selection)) {
							selectionManagerCtrl.getSelection().length = 0;
						} else {
							updateSelection(null);
						}
					}
				};

				$timeout(function() {
					if (selectionManagerCtrl.isMultiSelect) {
						$scope.$watchCollection(
							selectionManagerCtrl.getSelection,
							function(newArray, oldArray) {
								if (!newArray) {newArray = [];}
								if (!oldArray) {oldArray = [];}

								var oldArrayIndex = oldArray.length;
								while(oldArrayIndex--) {
									var oldItem = oldArray[oldArrayIndex];
									if (newArray.indexOf(oldItem) === -1) {
										$scope.$broadcast(onDeselectEvent, oldItem);
									}
								}

								var newArrayIndex = newArray.length;
								while(newArrayIndex--) {
									var newItem = newArray[newArrayIndex];
									if (oldArray.indexOf(newItem) === -1) {
										$scope.$broadcast(onSelectEvent, newItem);
									}
								}
							}
						);
					} else {
						$scope.$watch(
							selectionManagerCtrl.getSelection,
							function(newVal, oldVal) {
								$scope.$broadcast(onDeselectEvent, oldVal);
								$scope.$broadcast(onSelectEvent, newVal);
							}
						);
					}
					$scope.$watch(
						selectionManagerCtrl.getSoftSelection,
						function(newVal, oldVal) {
							$scope.$broadcast(onSoftDeselectEvent, oldVal);
							$scope.$broadcast(onSoftSelectEvent, newVal);
						}
					);
				});
				return selectionManagerCtrl;
			}],
			compile: function ($element, $attrs) {
				var directiveName = this.name;
				var modelLocation = $attrs[directiveName];
				var parsedModelAttr = $parse(modelLocation);
				var isMultiSelect = angular.isDefined($attrs.nzMultiSelect);
				return {
					pre: function (scope, element, attrs, selectionManagerCtrl) {
						selectionManagerCtrl.isMultiSelect = isMultiSelect;
						selectionManagerCtrl._locationOfSelection = parsedModelAttr;
					},
					post: function (scope, element, attrs, selectionManagerCtrl) {

					}
				}

			}
        };
    }]);

	module.directive('nzSelectionKeyboardNavigation', ['$timeout', function ($timeout) {
		return {
			restrict: 'A',
			require: ['nzSelectionKeyboardNavigation', '^nzSelectionManager'],
			controller: ['$scope', function($scope) {
				var keyboardNavigationCtrl;
				keyboardNavigationCtrl = {
					hasVerticalKeyboardNavigation: function() {
						if (arguments[0]) {
							keyboardNavigationCtrl._hasVerticalKeyboardNavigation = !!arguments[0];
							keyboardNavigationCtrl._hasHorizontalKeyboardNavigation = !keyboardNavigationCtrl._hasVerticalKeyboardNavigation;
						}
						return !!keyboardNavigationCtrl._hasVerticalKeyboardNavigation;
					},
					hasHorizontalKeyboardNavigation: function() {
						if (arguments[0]) {
							keyboardNavigationCtrl._hasHorizontalKeyboardNavigation = !!arguments[0];
							keyboardNavigationCtrl._hasVerticalKeyboardNavigation = !keyboardNavigationCtrl._hasHorizontalKeyboardNavigation;
						}
						return !!keyboardNavigationCtrl._hasHorizontalKeyboardNavigation;
					}
				};
				return keyboardNavigationCtrl;
			}],
			compile: function ($element, $attrs) {
				if (!$element.attr('tabindex')) {
					$element.attr('tabindex', '-1');
				}

				return {
					pre: function (scope, element, attrs, ctrls) {
						var nzKeyboardNavigationCtrl =  ctrls[0];
						var nzSelectionManagerCtrl = ctrls[1];
/*
						var originalSetSelect = nzSelectionManagerCtrl.addSelected;
						nzSelectionManagerCtrl.addSelected = function(selectedElement) {
							originalSetSelect.call(this, selectedElement);
							nzKeyboardNavigationCtrl.setSoftSelect(selectedElement);
						}
*/
						nzKeyboardNavigationCtrl.hasHorizontalKeyboardNavigation(true);
					},
					post: function (scope, element, attrs, ctrls) {
						var nzKeyboardNavigationCtrl =  ctrls[0];
						var nzSelectionManagerCtrl = ctrls[1];

						// Keyboard Navigation
						var setSelectionKeyPress = function(event) {
							// Enter or Space
							if (event.keyCode === 13 || event.keyCode === 32) {
								nzSelectionManagerCtrl.clearSelection();
								var softSelection = nzSelectionManagerCtrl.getSoftSelection();
								var selectionElem = nzSelectionManagerCtrl.getElementFromObj(softSelection);
								nzSelectionManagerCtrl.addSelected(selectionElem);
								event.preventDefault();
								event.stopPropagation();
							}
						};
						var horizontalNavigarionKeyPress = function(event) {
							if (event.keyCode === 38) {
								// key up
								var softSelection = nzSelectionManagerCtrl.getSoftSelection();
								var selectionElem = nzSelectionManagerCtrl.getElementFromObj(softSelection);
								var prevElement = nzSelectionManagerCtrl.getPreviousSelectableElement(selectionElem);
								nzSelectionManagerCtrl.setSoftSelection(prevElement);
								event.preventDefault();
								event.stopPropagation();
							}
							if (event.keyCode === 40) {
								// key down
								var softSelection = nzSelectionManagerCtrl.getSoftSelection();
								var selectionElem = nzSelectionManagerCtrl.getElementFromObj(softSelection);
								var nextElement = nzSelectionManagerCtrl.getNextSelectableElement(selectionElem);
								nzSelectionManagerCtrl.setSoftSelection(nextElement);
								event.preventDefault();
								event.stopPropagation();
							}
							setSelectionKeyPress(event);

							scope.$apply();
						};

						var isWatchInitalized = false;
						var watchResults = {};
						scope.$watch(
							function() {
								if (isWatchInitalized) {
									watchResults.verticalNavigarion =   nzKeyboardNavigationCtrl.hasVerticalKeyboardNavigation();
									watchResults.horizontalNavigarion = nzKeyboardNavigationCtrl.hasHorizontalKeyboardNavigation();
								}
								isWatchInitalized = true;

								return watchResults;
							},
							function(newVal, oldVal) {
								if (newVal.horizontalNavigarion && !oldVal.horizontalNavigarion) {
									// Add horizontal keyboard navigation
									element.on('keydown', horizontalNavigarionKeyPress);
									oldVal.horizontalNavigarion = true;
								} else if (!newVal.horizontalNavigarion && oldVal.horizontalNavigarion) {
									// Remove horizontal keyboard navigation
									element.off('keydown', horizontalNavigarionKeyPress);
									oldVal.horizontalNavigarion = false;
								}
								if (newVal.verticalNavigarion && !oldVal.verticalNavigarion) {
									// Add vertical keyboard navigation
								} else if (!newVal.verticalNavigarion && oldVal.verticalNavigarion) {
									// Remove vertical keyboard navigation
								}
							}, true
						);
					}
				}

			}
        };
    }]);

})(angular);
