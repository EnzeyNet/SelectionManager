(function (angular) {
    "use strict";

	var module = angular.module('net.enzey.selection-manager', [
		'net.enzey.selection-manager.config',
		'net.enzey.selection-manager.selection',
		'net.enzey.selection-manager.keyboard-navigation'
	]);

    module.directive('nzSelectionManager', function ($parse, $timeout, nzSelectionManagerEvents) {
        return {
			restrict: 'A',
			require: 'nzSelectionManager',
			controller: function($scope, $timeout, $element, $attrs) {
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
					if (lastSoftSelectedElement && $element[0].contains(lastSoftSelectedElement)) {
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
					if (!isMultiSelect || !$element[0].contains(lastSoftSelectedElement)) {
						ctrl.addSelected(element);
					} else {
						var selectedElement = angular.element(element);
						var selectableCtrl = selectedElement.controller('nzSelectable');
						if (selectableCtrl) {
							if (lastSoftSelectedElement) {
								var lastSelectedElemBackup = lastSoftSelectedElement;

								ctrl.clearSelection();

								var selectableElems = ctrl.getAllSelectables();
								var currectSelectedIndex = selectableElems.indexOf(element);
								var lastSelectedIndex = selectableElems.indexOf(lastSelectedElemBackup);

								var selectedSpan = selectableElems.slice(Math.min(lastSelectedIndex, currectSelectedIndex), Math.max(lastSelectedIndex, currectSelectedIndex) + 1);
								selectedSpan.forEach(function(selectedElem) {
									selectedElem = angular.element(selectedElem);
									ctrl.addSelected(selectedElem);
								});

								lastSoftSelectedElement = lastSelectedElemBackup;
								ctrl.setSoftSelection(lastSoftSelectedElement);
							}
						}
					}
				};
				this.getNextSelectableElement = function() {
					var nextElement = null;
					var selectableElems = ctrl.getAllSelectables();
					if (lastSoftSelectedElement && $element[0].contains(lastSoftSelectedElement)) {
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
					if (lastSoftSelectedElement && $element[0].contains(lastSoftSelectedElement)) {
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
									$scope.$broadcast(nzSelectionManagerEvents.getDeselectEvent(), oldItem);
								}
							}

							var newArrayIndex = newArray.length;
							while(newArrayIndex--) {
								var newItem = newArray[newArrayIndex];
								if (oldArray.indexOf(newItem) === -1) {
									$scope.$broadcast(nzSelectionManagerEvents.getSelectEvent(), newItem);
								}
							}
						}
					);
				} else {
					$scope.$watch(
						ctrl.getSelection,
						function(newVal, oldVal) {
							$scope.$broadcast(nzSelectionManagerEvents.getDeselectEvent(), oldVal);
							$scope.$broadcast(nzSelectionManagerEvents.getSelectEvent(), newVal);
						}
					);
				}
				$scope.$watch(
					ctrl.getSoftSelection,
					function(newVal, oldVal) {
						$scope.$broadcast(nzSelectionManagerEvents.getSoftDeselectEvent(), oldVal);
						$scope.$broadcast(nzSelectionManagerEvents.getSoftSelectEvent(), newVal);
					}
				);

				// The return is needed to support Angular 1.2
				return ctrl;
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

})(angular);
