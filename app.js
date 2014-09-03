angular.module('wochenplaner', ['ui.router', 'ngCookies','ngSanitize' ])
	.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
		$urlRouterProvider.otherwise('/');
		$stateProvider
			.state('home', {
				url: '/',
				templateUrl: 'templates/wochenplaner.html',
				controller: 'wochenplanerCtrl'
			})
	}]
)
