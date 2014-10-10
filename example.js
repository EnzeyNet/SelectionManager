(function (angular) {
	"use strict";

	var module = angular.module('net.enzey.example',
		[
			'net.enzey.selection-manager'
		]
	);

	module.controller('selectionManagerCtrl', function ($scope) {
		$scope.itemList = [
			{text: "red"},
			{text: "blue"},
			{text: "purple"},
			{text: "while"},
			{text: "black"},
		];
	});
})(angular);
