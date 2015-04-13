(function (angular) {
    "use strict";

	var module = angular.module('net.enzey.selection-manager.keyboard-navigation', []);

	module.directive('nzSelectionKeyboardNavigation', function ($parse) {
		return {
			restrict: 'A',
			require: ['nzSelectionKeyboardNavigation', '^nzSelectionManager'],
			controller: function($scope) {
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
									element[0].addEventListener('keydown', horizontalNavigarionKeyPress);
									oldVal.horizontalNavigarion = true;
								} else if (!newVal.horizontalNavigarion && oldVal.horizontalNavigarion) {
									// Remove horizontal keyboard navigation
									element[0].removeEventListener('keydown', horizontalNavigarionKeyPress);
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
