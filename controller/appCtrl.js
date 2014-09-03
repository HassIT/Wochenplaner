'use strict';
angular.module('wochenplaner')
	.controller('appCtrl', ['$scope',"$location",'$window','$cookieStore',"$filter", function($scope,$location, $window,$cookieStore,$filter) {
		
		$scope.mitarbeiter = [];
		$scope.mitarbeiter = $cookieStore.get('sgMitarbeiter');

		$scope.von = "";
		$scope.bis = "";
		$scope.weekdays = [ 
			{val:"Mo"},
	        {val:"Di"},
			{val:"Mi"},
			{val:"Do"},
			{val:"Fr"},
			{val:"Sa"}
		];
		$scope.uhrzeiten =[ {val:"10:00"},
							{val:"11:00"},
							{val:"12:00"},
							{val:"13:00"},
							{val:"14:00"},
							{val:"15:00"},
							{val:"16:00"},
							{val:"17:00"},
							{val:"18:00"},
							{val:"19:00"}
						];
	
		
		
		$scope.calcRestunden = function (idx) {
			var summeStd = 0;
			angular.forEach( $scope.weekdays,function(day, key){
				if (day.mitarbeiter[idx].stunden) {
					summeStd += day.mitarbeiter[idx].stunden;
				}
			})
		
			angular.forEach( $scope.weekdays,function(day, key){
				day.mitarbeiter[idx].reststunden =$scope.mitarbeiter[idx].std - summeStd;
			})
		}



		$scope.weekdays2 = function() {
			angular.forEach( $scope.weekdays,function(day, key){
			
			    if (!day.mitarbeiter) day.mitarbeiter =[];
				angular.forEach($scope.mitarbeiter, function(mitarb, key2) {
					if (!day.mitarbeiter[key2]) {
						day.mitarbeiter[key2] = angular.copy(mitarb);
						day.mitarbeiter[key2].uhrzeiten = [];
						day.mitarbeiter[key2].uhrzeiten =  angular.copy($scope.uhrzeiten);
					} else {
						day.mitarbeiter[key2].name = mitarb.name;
						day.mitarbeiter[key2].std  = mitarb.std;
					
					}
					
				})
			})
			angular.forEach($scope.mitarbeiter, function(mitarb, key2) {
				$scope.calcRestunden(key2);
			})
			$cookieStore.remove('sgMitarbeiter');
		    $cookieStore.put('sgMitarbeiter',$scope.mitarbeiter);
		}
		
        if (!$scope.mitarbeiter){
			$scope.mitarbeiter = [];
		} else {
			$scope.weekdays2();
		}
		
		$scope.genOutput= function(){
			var html = "";
			if ($scope.filiale) {
				html += '<p> Filale:' +   $scope.filiale + '</p>';    
			}
			if ($scope.kw) {
				html += '<p>Kalendarwoche:' + $scope.kw + '</p>';    
			}


			html += '<table class="pdfrender">';
			angular.forEach($scope.weekdays,function(day, key) {
				//Setzen des WOchentages
				html += '<tr><th colspan="24" class="day">' + day.val +'</th></tr>';
				//Setzen der Zeitleiste des Wochentages
				html += '<tr><th></th>';
				angular.forEach($scope.uhrzeiten,function(uhrzeit, key2) {
					html += '<th colspan="2" class="time">' + uhrzeit.val + '</th>';
				})
				html += '<th class="time">von</th><th class="time">bis</th><th class="time">Stunden</th></tr>';
			
				//Für jeden Mitarbeiter seine Tages werte
				angular.forEach(day.mitarbeiter,function(mitarb, key3) {
					html += '<tr>';
					html += '<td class="data">'+ mitarb.name + '</td>';
					angular.forEach(mitarb.uhrzeiten,function(stunden, key4) {
						if (!stunden.voll) {
							html += '<td class="links white"></td>';
						} else {
							html += '<td class="links rot"></td>';
						}
						if (!stunden.halb) {
							html += '<td class="rechts white"></td>';
						} else {
							html += '<td class="rechts rot"></td>';
						}
					})
					if (mitarb.von) {
						html += '<td class="data">'+ mitarb.von + '</td>';
					} else {
						html += '<td class="data"></td>';
					}
					if (mitarb.bis) {
						html += '<td class="data">'+ mitarb.bis + '</td>';
					} else {
						html += '<td class="data"></td>';
					}
					if (mitarb.stunden) {
						html += '<td class="data">'+ mitarb.stunden + '</td>';
					} else {
						html += '<td class="data"></td>';
					}
					html += '</tr>';
				});
			});
			html += '</table>';
			$scope.doc = html;
		}

		$scope.weektotal = function() {
			var total = 0;
			angular.forEach($scope.mitarbeiter, function(item) {
				total += item.std;
			})
			return total;
		}

		$scope.calcAll = function(mitarbeiter,idx){
			//var checkbox = $event.target;
			var dec = 0;
			var uhrzeiten = mitarbeiter.uhrzeiten;
			var voll = $filter('filter')(uhrzeiten,{voll:true},true);
			var halb = $filter('filter')(uhrzeiten,{halb:true},true);

			if (!voll) {
				voll = [];
				voll[0] = {val : "21:00"};
				dec = 1;
			}
			if (!halb) {
				halb = [];
				halb[0] = {val:"21:00"};
				dec = 1;
			}
		
			if (!voll[0]) {
				voll[0] = {val : "21:00"};
				dec = 1;
			}		
			if (!halb[0]) {
				halb[0] = {val:"21:00"};
				dec = 1;
			}		
			halb[0].val = halb[0].val.replace(':00',':30');
			halb[halb.length-1].val = halb[halb.length-1].val.replace(':00',':30');


			if (voll[0].val < halb[0].val){
				mitarbeiter.von = voll[0].val;
			} else {
				mitarbeiter.von = halb[0].val;
			}
		
			if ((voll[voll.length-1].val > halb[halb.length-1].val) || halb[halb.length-1].val == "21:30" ){
				mitarbeiter.bis = voll[voll.length-1].val;
			} else {
				mitarbeiter.bis = halb[halb.length-1].val;
			}
		
			mitarbeiter.stunden = (voll.length + halb.length -dec ) / 2;
			$scope.calcRestunden( idx); 
		}		
		
	}])
	.directive('resize', function ($window) {
		return function (scope, element) {
			scope.container_wh = function () {
				y = Math.round($window.innerHeight);
				var x = $window.innerWidth;
				var y = $window.innerHeight;
				if ( ($window.innerWidth / $window.innerHeight) > 0.64 ) {
					x = Math.round($window.innerHeight * .64);
				} else {
					y = Math.round($window.innerWidth / .64);
				}
				return  { width: x + "px", height: y + "px"};
			}
			angular.element($window).bind('resize', function() {
				scope.$apply();
			});
		}
	})
