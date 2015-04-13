(function (angular) {
	"use strict";

	var module = angular.module('net.enzey.example',
		[
			'net.enzey.selection-manager'
		]
	);

	// https://www.sba.gov/about-sba/sba_performance/sba_data_store/web_service_api/u_s_city_and_county_web_data_api#city-county-state
	module.service('TestDataSets', function($http, $q) {
		var countyInfo = $q.defer();
		$http.get('countyInfo.json')
		.success(function(data, status, headers, config) {
            countyInfo.resolve(data);
		})
		.error(function(data, status, headers, config) {
            countyInfo.reject(data);
		});

		var cityInfo = $q.defer();
		$http.get('cityInfo.json')
		.success(function(data, status, headers, config) {
            cityInfo.resolve(data);
		})
		.error(function(data, status, headers, config) {
            cityInfo.reject(data);
		});

		return {
			getCountyInfo: function() {
				return countyInfo.promise;
			},
			getCityInfo: function() {
				return cityInfo.promise;
			}
		}
	});

	module.config(function(nzSelectionManagerConfigProvider) {
		nzSelectionManagerConfigProvider.setSoftSelectionClass('softSelected');
		nzSelectionManagerConfigProvider.setSelectionClass('selection');
	});

	module.controller('selectionManagerCtrl', function ($scope, TestDataSets) {
		TestDataSets.getCityInfo().then(function(data) {
			$scope.cityInfo = data;
		});

		$scope.colorList = [
			{text: "red"},
			{text: "blue"},
			{text: "purple"},
			{text: "while"},
			{text: "black"},
			{text: "green"},
			{text: "yellow"},
			{text: "orange"},
		];

		$scope.objectItem = {
			name: 'Joseph Aspelund',
			color: 'red',
			age: 31,
		};

		$scope.cityName = '';
	});

})(angular);
