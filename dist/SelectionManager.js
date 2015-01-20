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

	module.service('nzSelectionClassApplier', ['nzSelectionManagerConfig', function(nzSelectionManagerConfig) {
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
	}]);

	module.directive('nzSelectionClass', ['nzSelectionClassApplier', function (nzSelectionClassApplier) {
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

						var selectionObj = selectionClassCtrl.selectionObj;
						nzSelectionClassApplier.applySelectionClass(selectionManagerCtrl, element, selectionObj, $attrs[directiveName]);
						nzSelectionClassApplier.addSelectionEvents(scope, element, selectionObj, $attrs[directiveName]);
					}
				}
			}
        };
	}]);

	module.directive('nzSoftSelectionClass', ['nzSelectionClassApplier', function (nzSelectionClassApplier) {
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

						var selectionObj = selectionClassCtrl.selectionObj;
						nzSelectionClassApplier.applySoftSelectionClass(selectionManagerCtrl, element, selectionObj, $attrs[directiveName]);
						nzSelectionClassApplier.addSoftSelectionEvents(scope, element, selectionObj, $attrs[directiveName]);
					}
				}
			}
        };
	}]);

    module.directive('nzSelectable', ['$parse', 'nzSelectionClassApplier', function ($parse, nzSelectionClassApplier) {
        return {
			restrict: 'A',
			controller: ['$scope', function($scope) {
				var ctrl = this;

				this.getSelectionObject = function() {
					return ctrl.selectionObj;
				};

				// The return is needed to support Angular 1.2
				return this;
			}],
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
    }]);

    module.directive('nzSelectionManager', ['$parse', '$document', '$timeout', function ($parse, $document, $timeout) {
        return {
			restrict: 'A',
			require: 'nzSelectionManager',
			controller: ['$scope', '$timeout', '$element', '$attrs', function($scope, $timeout, $element, $attrs) {
				var ctrl = this;

				var isMultiSelect = angular.isDefined($attrs.nzMultiSelect);
				var lastSelectedElement = null;
				var lastSoftSelectedElement = null;

				var updateSelection = function (value) {
					if (ctrl._locationOfSelection) {
						ctrl._locationOfSelection.assign($scope, value);
					} else {
						ctrl._selection = value;
					}
				};
				var updateSoftSelection = function (value) {
					if (ctrl._locationOfSoftSelection) {
						ctrl._locationOfSoftSelection.assign($scope, value);
					} else {
						ctrl._softSelection = value;
					}
				};

				this.scope = $scope;
				this._locationOfSelection = angular.isDefined($attrs.ngModel) ? $parse($attrs.ngModel) : null;
				this._locationOfSoftSelection = null;
				this.getAllSelectables = function() {
					var results = [];
					var selectableElems = $element[0].querySelectorAll('*[nz-selectable], *[data-nz-selectable]');
					for (var i = 0; i < selectableElems.length; i++) {
						results.push(selectableElems[i]);
					}
					return results;
				};
				this.toggleSoftSelectAsSelected = function() {
					if (lastSoftSelectedElement && $document[0].contains(lastSoftSelectedElement)) {
						ctrl.addSelected(lastSoftSelectedElement, true);
					}
				};
				this.getSelection = function() {
					var selection = ctrl._selection;
					if (ctrl._locationOfSelection) {
						selection = ctrl._locationOfSelection($scope);
					}
					if (isMultiSelect && !selection) {
						selection = [];
					}

					return selection;
				};
				this.getSoftSelection = function() {
					var softSelection = ctrl._softSelection;
					if (ctrl._locationOfSoftSelection) {
						softSelection = ctrl._locationOfSoftSelection($scope);
					}

					return softSelection;
				};
				this.setSoftSelection = function(selectedElement) {
					lastSoftSelectedElement = selectedElement;
					selectedElement = angular.element(selectedElement);
					var selectableCtrl = selectedElement.controller('nzSelectable');
					if (selectableCtrl) {
						selectedElement[0].focus();
						updateSoftSelection(selectableCtrl.getSelectionObject());
					}
				};
				this.isSelected = function(selectionObj) {
					if (isMultiSelect) {
						return ctrl.getSelection().indexOf(selectionObj) > -1;
					} else {
						return ctrl.getSelection() === selectionObj;
					}
				};
				this.addSelected = function(element, toggleSelection) {
					var selectedElement = angular.element(element);
					var selectableCtrl = selectedElement.controller('nzSelectable');
					if (selectableCtrl) {
						lastSelectedElement = element;
						var currentSelections = ctrl.getSelection();
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
						ctrl.setSoftSelection(lastSelectedElement);
					}
				};
				this.rangeSelectFromLast = function(element) {
					if (!isMultiSelect || !$document[0].contains(lastSelectedElement)) {
						ctrl.addSelected(element);
					} else {
						var selectedElement = angular.element(element);
						var selectableCtrl = selectedElement.controller('nzSelectable');
						if (selectableCtrl) {
							if (lastSelectedElement) {
								var lastSelectedElemBackup = lastSelectedElement;

								ctrl.clearSelection();

								var selectableElems = ctrl.getAllSelectables();
								var currectSelectedIndex = selectableElems.indexOf(element);
								var lastSelectedIndex = selectableElems.indexOf(lastSelectedElemBackup);

								var selectedSpan = selectableElems.slice(Math.min(lastSelectedIndex, currectSelectedIndex), Math.max(lastSelectedIndex, currectSelectedIndex) + 1);
								selectedSpan.forEach(function(selectedElem) {
									selectedElem = angular.element(selectedElem);
									ctrl.addSelected(selectedElem);
								});

								lastSelectedElement = lastSelectedElemBackup;
								ctrl.setSoftSelection(lastSelectedElement);
							}
						}
					}
				};
				this.getNextSelectableElement = function() {
					var nextElement = null;
					var selectableElems = ctrl.getAllSelectables();
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
						var currentSelection = ctrl.getSoftSelection();

						var indexOfCurrentSoftSelectedObj = selectableObjs.indexOf(currentSelection);
						nextElement = selectableElems[indexOfCurrentSoftSelectedObj];
						if (!nextElement) {
							nextElement = selectableElems[0];
						}
					}

					return nextElement;
				};
				this.getPreviousSelectableElement = function() {
					var prevElement = null;
					var selectableElems = ctrl.getAllSelectables();
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
						var currentSelection = ctrl.getSoftSelection();

						var indexOfCurrentSoftSelectedObj = selectableObjs.indexOf(currentSelection);
						prevElement = selectableElems[indexOfCurrentSoftSelectedObj];
						if (!prevElement) {
							prevElement = selectableElems[selectableElems.length - 1];
						}
					}

					return prevElement;
				};
				this.clearSelection = function() {
					var selection = ctrl.getSelection();
					if (angular.isArray(selection)) {
						ctrl.getSelection().length = 0;
					} else {
						updateSelection(null);
					}
				};

				if (isMultiSelect) {
					$scope.$watchCollection(
						ctrl.getSelection,
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
						ctrl.getSelection,
						function(newVal, oldVal) {
							$scope.$broadcast(onDeselectEvent, oldVal);
							$scope.$broadcast(onSelectEvent, newVal);
						}
					);
				}
				$scope.$watch(
					ctrl.getSoftSelection,
					function(newVal, oldVal) {
						$scope.$broadcast(onSoftDeselectEvent, oldVal);
						$scope.$broadcast(onSoftSelectEvent, newVal);
					}
				);

				// The return is needed to support Angular 1.2
				return ctrl;
			}],
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
    }]);

	module.directive('nzSelectionKeyboardNavigation', ['$parse', function ($parse) {
		return {
			restrict: 'A',
			require: ['nzSelectionKeyboardNavigation', '^nzSelectionManager'],
			controller: ['$scope', function($scope) {
				var ctrl = this;

				this.hasVerticalKeyboardNavigation = function() {
					if (arguments[0]) {
						ctrl._hasVerticalKeyboardNavigation = !!arguments[0];
						ctrl._hasHorizontalKeyboardNavigation = !ctrl._hasVerticalKeyboardNavigation;
					}
					return !!ctrl._hasVerticalKeyboardNavigation;
				};
				this.hasHorizontalKeyboardNavigation = function() {
					if (arguments[0]) {
						ctrl._hasHorizontalKeyboardNavigation = !!arguments[0];
						ctrl._hasVerticalKeyboardNavigation = !ctrl._hasHorizontalKeyboardNavigation;
					}
					return !!ctrl._hasHorizontalKeyboardNavigation;
				};

				// The return is needed to support Angular 1.2
				return ctrl;
			}],
			compile: function ($element, $attrs) {
				if (!$element.attr('tabindex')) {
					$element.attr('tabindex', '-1');
				}

				return {
					pre: function (scope, element, attrs, ctrls) {
						var nzKeyboardNavigationCtrl =  ctrls[0];
						var nzSelectionManagerCtrl = ctrls[1];

						nzKeyboardNavigationCtrl.hasHorizontalKeyboardNavigation(true);
						nzSelectionManagerCtrl._locationOfSoftSelection = angular.isDefined($attrs.softSelectModel) ? $parse($attrs.softSelectModel) : null;
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
    }]);

})(angular);
