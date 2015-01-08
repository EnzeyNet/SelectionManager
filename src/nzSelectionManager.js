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

	module.service('nzSelectionClassApplier', function(nzSelectionManagerConfig) {
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
			},
			addSelectionEvents: function(scope, element, selectionObj, selectionClass) {
				if (!selectionClass) {selectionClass = nzSelectionManagerConfig.getSelectionClass()}

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
				var ctrl;
				ctrl = {
					getSelectionObject: function() {
						return ctrl.selectionObj;
					}
				};

				return ctrl;
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
							event.stopPropagation();
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

    module.directive('nzSelectionManager', function ($parse, $document, $timeout) {
        return {
			restrict: 'A',
			require: 'nzSelectionManager',
			controller: function($scope, $timeout, $element, $attrs) {
				var selectionManagerCtrl;

				var isMultiSelect = angular.isDefined($attrs.nzMultiSelect);
				var lastSelectedElement = null;
				var lastSoftSelectedElement = null;

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
					_locationOfSelection: angular.isDefined($attrs.ngModel) ? $parse($attrs.ngModel) : null,
					_locationOfSoftSelection: null,
					getAllSelectables: function() {
						var results = [];
						var selectableElems = $element[0].querySelectorAll('*[nz-selectable], *[data-nz-selectable]');
						for (var i = 0; i < selectableElems.length; i++) {
							results.push(selectableElems[i]);
						}
						return results;
					},
					toggleSoftSelectAsSelected: function() {
						if (lastSoftSelectedElement && $document[0].contains(lastSoftSelectedElement)) {
							selectionManagerCtrl.addSelected(lastSoftSelectedElement, true);
						}
					},
					getSelection: function() {
						var selection = selectionManagerCtrl._selection;
						if (selectionManagerCtrl._locationOfSelection) {
							selection = selectionManagerCtrl._locationOfSelection($scope);
						}
						if (isMultiSelect && !selection) {
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
						lastSoftSelectedElement = selectedElement;
						selectedElement = angular.element(selectedElement);
						var selectableCtrl = selectedElement.controller('nzSelectable');
						if (selectableCtrl) {
							updateSoftSelection(selectableCtrl.getSelectionObject());
						}
					},
					isSelected: function(selectionObj) {
						if (isMultiSelect) {
							return selectionManagerCtrl.getSelection().indexOf(selectionObj) > -1;
						} else {
							return selectionManagerCtrl.getSelection() === selectionObj;
						}
					},
					addSelected: function(element, toggleSelection) {
						var selectedElement = angular.element(element);
						var selectableCtrl = selectedElement.controller('nzSelectable');
						if (selectableCtrl) {
							lastSelectedElement = element;
							var currentSelections = selectionManagerCtrl.getSelection();
							var selectedObj = selectableCtrl.getSelectionObject();
							if (isMultiSelect) {
								var indexOfData = currentSelections.indexOf(selectedObj);
								if (indexOfData === -1) {
									currentSelections.push(selectedObj);
								} else if (toggleSelection) {
									currentSelections.splice(indexOfData,1);
								}
							} else {
								if (currentSelections !== selectedObj) {
									currentSelections = selectedObj;
								} else if (toggleSelection) {
									currentSelections = undefined;
								}
							}
							updateSelection(currentSelections);
							selectionManagerCtrl.setSoftSelection(lastSelectedElement);
						}
					},
					rangeSelectFromLast: function(element) {
						if (!isMultiSelect || !$document[0].contains(lastSelectedElement)) {
							selectionManagerCtrl.addSelected(element);
						} else {
							var selectedElement = angular.element(element);
							var selectableCtrl = selectedElement.controller('nzSelectable');
							if (selectableCtrl) {
								if (lastSelectedElement) {
									var lastSelectedElemBackup = lastSelectedElement;

									selectionManagerCtrl.clearSelection();

									var selectableElems = selectionManagerCtrl.getAllSelectables();
									var currectSelectedIndex = selectableElems.indexOf(element);
									var lastSelectedIndex = selectableElems.indexOf(lastSelectedElemBackup);

									var selectedSpan = selectableElems.slice(Math.min(lastSelectedIndex, currectSelectedIndex), Math.max(lastSelectedIndex, currectSelectedIndex) + 1);
									selectedSpan.forEach(function(selectedElem) {
										selectedElem = angular.element(selectedElem);
										selectionManagerCtrl.addSelected(selectedElem);
									});

									lastSelectedElement = lastSelectedElemBackup;
									selectionManagerCtrl.setSoftSelection(lastSelectedElement);
								}
							}
						}
					},
					getNextSelectableElement: function() {
						var nextElement = null;
						var selectableElems = selectionManagerCtrl.getAllSelectables();
						if (lastSoftSelectedElement && $document[0].contains(lastSoftSelectedElement)) {
							var currentElementIndex = selectableElems.indexOf(lastSoftSelectedElement);
							currentElementIndex++;
							nextElement = selectableElems[currentElementIndex];
							if (!nextElement) {
								nextElement = selectableElems[0];
							}
						} else {
							var selectableObjs = selectableElems.map(function(elem) {
								var elem = angular.element(elem);
								var selectableCtrl = elem.controller('nzSelectable');
								if (selectableCtrl) {
									return selectableCtrl.getSelectionObject();
								}
							});
							var currentSelection = selectionManagerCtrl.getSoftSelection();

							var indexOfCurrentSoftSelectedObj = selectableObjs.indexOf(currentSelection);
							nextElement = selectableElems[indexOfCurrentSoftSelectedObj];
							if (!nextElement) {
								nextElement = selectableElems[0];
							}
						}

						return nextElement;
					},
					getPreviousSelectableElement: function() {
						var prevElement = null;
						var selectableElems = selectionManagerCtrl.getAllSelectables();
						if (lastSoftSelectedElement && $document[0].contains(lastSoftSelectedElement)) {
							var currentElementIndex = selectableElems.indexOf(lastSoftSelectedElement);
							currentElementIndex--;
							prevElement = selectableElems[currentElementIndex];
							if (!prevElement) {
								prevElement = selectableElems[selectableElems.length - 1];
							}
						} else {
							var selectableObjs = selectableElems.map(function(elem) {
								var elem = angular.element(elem);
								var selectableCtrl = elem.controller('nzSelectable');
								if (selectableCtrl) {
									return selectableCtrl.getSelectionObject();
								}
							});
							var currentSelection = selectionManagerCtrl.getSoftSelection();

							var indexOfCurrentSoftSelectedObj = selectableObjs.indexOf(currentSelection);
							prevElement = selectableElems[indexOfCurrentSoftSelectedObj];
							if (!prevElement) {
								prevElement = selectableElems[selectableElems.length - 1];
							}
						}

						return prevElement;
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

				if (isMultiSelect) {
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

				return selectionManagerCtrl;
			},
			compile: function ($element, $attrs) {
				var directiveName = this.name;

				return {
					pre: function (scope, element, attrs, selectionManagerCtrl) {

					},
					post: function (scope, element, attrs, selectionManagerCtrl) {

					}
				}

			}
        };
    });

	module.directive('nzSelectionKeyboardNavigation', function ($parse) {
		return {
			restrict: 'A',
			require: ['nzSelectionKeyboardNavigation', '^nzSelectionManager'],
			controller: function($scope) {
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
			},
			compile: function ($element, $attrs) {
				if (!$element.attr('tabindex')) {
					$element.attr('tabindex', '-1');
				}

				return {
					pre: function (scope, element, attrs, ctrls) {
						var nzKeyboardNavigationCtrl =  ctrls[0];
						var nzSelectionManagerCtrl = ctrls[1];

						nzKeyboardNavigationCtrl.hasHorizontalKeyboardNavigation(true);
						nzSelectionManagerCtrl._locationOfSoftSelection = $parse($attrs.ngModel);
					},
					post: function (scope, element, attrs, ctrls) {
						var nzKeyboardNavigationCtrl =  ctrls[0];
						var nzSelectionManagerCtrl = ctrls[1];

						// Keyboard Navigation
						var setSelectionKeyPress = function(event) {
							// Enter or Space
							if (event.keyCode === 13 || event.keyCode === 32) {
								nzSelectionManagerCtrl.toggleSoftSelectAsSelected();
								event.preventDefault();
								event.stopPropagation();
							}
						};
						var horizontalNavigarionKeyPress = function(event) {
							if (event.keyCode === 38) {
								// key up
								var prevElement = nzSelectionManagerCtrl.getPreviousSelectableElement();
								nzSelectionManagerCtrl.setSoftSelection(prevElement);
								event.preventDefault();
								event.stopPropagation();
							}
							if (event.keyCode === 40) {
								// key down
								var nextElement = nzSelectionManagerCtrl.getNextSelectableElement();
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
    });

})(angular);