'use strict';
angular.module('wochenplaner')
	.controller('appCtrl', ['$scope','$window','$cookieStore',"$filter", function($scope, $window,$cookieStore,$filter) {
		
		//Init
		//Array für die Mitarbeiter
		$scope.mitarbeiter = [];
		//Cookie um die Mitarbeiter für die nächste Session zu speichern
		$scope.mitarbeiter = $cookieStore.get('sgMitarbeiter');

		//Wir zur Zeit nicht benutzt ist für die Öffnungszeiten
		$scope.von = "";
		$scope.bis = "";
		
		//Array Arbeitswochentage
		$scope.weekdays = [ 
			{val:"Mo"},
	        {val:"Di"},
			{val:"Mi"},
			{val:"Do"},
			{val:"Fr"},
			{val:"Sa"}
		];
		
		//Array für die Uhrzeiten
		$scope.uhrzeiten =[ {val:"09:00",intval:900},
							{val:"10:00",intval:1000},
							{val:"11:00",intval:1100},
							{val:"12:00",intval:1200},
							{val:"13:00",intval:1300},
							{val:"14:00",intval:1400},
							{val:"15:00",intval:1500},
							{val:"16:00",intval:1600},
							{val:"17:00",intval:1700},
							{val:"18:00",intval:1800},
							{val:"19:00",intval:1900},
							{val:"20:00",intval:2000}
						];
	
		
		
		//Kalkuliert die Rest-Wochenstunden eines Mitarbeiters
		function calcRestunden (idx) {
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

		// Legt eine Kopie des Mitarbeiters und seiner Arbeitzeiten für den Wochentag an
		// Und speichert diese in einem Cookie
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
				calcRestunden(key2);
			})
			$cookieStore.remove('sgMitarbeiter');
		    $cookieStore.put('sgMitarbeiter',$scope.mitarbeiter);
		}
		
		//Wenn es noch keine gepflegte Mitarbeiter gibt
		//Wird hier das Mitarbeiter-Array initialisert
        if (!$scope.mitarbeiter){
			$scope.mitarbeiter = [];
		} else {
			$scope.weekdays2();
		}
		
		//Hier wie eine HTML-Tabelle erzeugt um 
		//diese per Scrennshot an jsPDF weiterzugeben
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
				html += '<tr><th colspan="28" class="header1 day">' + day.val +'</th></tr>';
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
		$scope.clear = function(){
			$scope.doc = " a";
		}
		
		//Berechner der Gesamt Wochenstundenzahl aller Mitarbeiter
		$scope.weektotal = function() {
			var total = 0;
			angular.forEach($scope.mitarbeiter, function(item) {
				total += item.std;
			})
			return total;
		}

		// Hier werden die Arbeitsstart und Endzeiten gesetzt
		$scope.calcAll = function(mitarbeiter,idx){
			//var checkbox = $event.target;
			var dec = 0;
			var uhrzeiten = angular.copy( mitarbeiter.uhrzeiten);
			var voll = $filter('filter')(uhrzeiten,{voll:true},true);
			var halb = angular.copy($filter('filter')(uhrzeiten,{halb:true},true));
			
			mitarbeiter.von = "";
			mitarbeiter.bis = "";
			
			if (!voll) {
				voll = [];
				voll[0] = {val : "21:00",intval:2400};
				dec = 1;
			}
			if (!halb) {
				halb = [];
				halb[0] = {val: "21:00",intval:2400};
				dec = 1;
			}
		
			if (!voll[0]) {
				voll[0] = {val : "21:00",intval:2400};
				dec = 1;
			}		
			if (!halb[0]) {
				halb[0] = {val:"21:00",intval:2400};
				dec = 1;
			}		

			
			if ( voll[0].intval <=  halb[0].intval){
				mitarbeiter.von =  angular.copy(voll[0].val);
			} else {
				mitarbeiter.von =  angular.copy(halb[0].val.replace(":00",":30" ) );
			}
		
			
		
			if (((voll[voll.length-1].intval > halb[halb.length-1].intval)  || halb[halb.length-1].intval == 2400 ) && voll[voll.length-1].intval != 2400 ){
				mitarbeiter.bis =  voll[voll.length-1].val.replace(':00',':30');
			} else if (halb[halb.length-1].intval != 2400)  {
				mitarbeiter.bis = "" + ((halb[halb.length-1].intval + 100)/100) +":00" ;
			}

			if (mitarbeiter.von=="24:00" || mitarbeiter.von=="24:30")  {
				mitarbeiter.von="";
			}
			if (mitarbeiter.bis=="24:00" || mitarbeiter.bis=="24:30")  {
				mitarbeiter.bis="";
			}
			mitarbeiter.stunden = (voll.length + halb.length -dec ) / 2;
			calcRestunden( idx); 
		}		
		
	}])
	// Wird zur Zeit noch nicht gesetzt
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
