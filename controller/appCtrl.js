'use strict';
angular.module('wochenplaner')
	.controller('appCtrl', ['$scope','$window','$cookieStore',"$filter", function($scope, $window,$cookieStore,$filter) {

		/* 	Applikation: Store-Wochenplaner
			Developed by Stefan Haß
		*/
		/*Validation pattern für Digits */
		var cookie_filiale = 'sgFiliale';
		var cookie_mitarbeiter = 'sgMitarbeiter';
		$scope.pattern_digit =/^(\d)+$/;
		//Init
		//Array für die Mitarbeiter
		$scope.mitarbeiter = [];
		$scope.filiale =[];
		$scope.kws=[];
		$scope.week=[];
		
		//Array Arbeitswochentage
		$scope.days = [ 
			{val:"Mo"},
	        {val:"Di"},
			{val:"Mi"},
			{val:"Do"},
			{val:"Fr"},
			{val:"Sa"}
		];
		
		//Array für die Uhrzeiten Muss noch mal bearbeitet werden
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
		
		//alert(JSON.stringify( $.cookie()));

		/*Cookies auf JSON-Format einstellen*/
		$.cookie.json = true;
		
		//Cookie um die Mitarbeiter für die nächste Session zu speichern
		$scope.mitarbeiter = $.cookie(cookie_mitarbeiter);  
		$scope.filiale = $.cookie(cookie_filiale); 

		//Wir zur Zeit nicht benutzt ist für die Öffnungszeiten
		if (!$scope.filiale) {
			$scope.filiale ={
				filnr:"007",
				year:2014,
				periode:9,
				kw_von:1,
				kw_bis:1,
				uhrzeit_von:"10:00",
				uhrzeit_bis:"21:00"
			};
		}

		/* #############
		Cookie Funtionen 
		##############*/
		function store_filale(){
			$.removeCookie(cookie_filiale);
			$.cookie(cookie_filiale, $scope.filiale, { expires: 9999 });
		}
		/*Umwandeln eines Base-36 Strings in ein Binaer-String um Flags zu setzen*/
		function parse_base36_uhrzeit( base_36_string){
			var uhrzeiten = angular.copy($scope.uhrzeiten);
			if (!base_36_string) return uhrzeiten;
			var dec = parseInt(base_36_string,36);
			var bytes = [];
			bytes = dec.toString(2);
			angular.forEach( uhrzeiten ,function(uhrzeit, key){
				if (bytes[key*2+1]=="1"){
					uhrzeit.voll =true;
				}
				if (bytes[key*2+2]=="1"){
					uhrzeit.halb =true;
				}
			})
			return uhrzeiten;
		}
		
		/* Funktion um das JSON Uhrzeit-Object komprimiert als base 36 darzustellen*/
		function get_cookiestring(mitarbeiter) {
			var binaer = "";
			var binaer2 = "";
			angular.forEach( mitarbeiter.uhrzeiten ,function(uhrzeit, key){
				if (!uhrzeit.voll) {
					binaer2 += "0";
				} else {
					binaer2 += "1";
				}
				if (!uhrzeit.halb) {
					binaer2 += "0";
				} else {
					binaer2 += "1";
				}
				if (parseInt( binaer2, 2 )>0) {
				   if (!binaer) binaer= "1";
					binaer += "" + binaer2;
					binaer2="";
				}
			})
			if (!binaer){
				return "";
			}
			var dec = parseInt( binaer, 2 );
			if (dec!=0){
				parse_base36_uhrzeit(dec.toString( 36 ));
				return dec.toString( 36 );
			} else {
				return "";
			}
		}
		
		/*
		*/
		function getKwDayMitarbeiterCookieName(kw_nr,day_idx, mitarb_idx ){
			return 'sgKw' + kw_nr + "_" + day_idx + "_" + mitarb_idx;
		}
		
		/*Funktion um einen Mitarbeiter-Arbeitstag im Cookie zu speichern*/
		function store_kw_day_mitarbeiter(kw_idx,day_idx,mitarbeiter_idx){
			if (!$scope.kws[kw_idx]) return;
			if (!$scope.kws[kw_idx].days[day_idx]) return;
			if (!$scope.kws[kw_idx].days[day_idx].mitarbeiter[mitarbeiter_idx]) return;
			var cookie_name = getKwDayMitarbeiterCookieName($scope.kws[kw_idx].kw,day_idx,mitarbeiter_idx);
			$.cookie.json = false;
			$.removeCookie(cookie_name );
			var cookiestring = get_cookiestring($scope.kws[kw_idx].days[day_idx].mitarbeiter[mitarbeiter_idx]);
			if (cookiestring) {
				$.cookie(cookie_name, cookiestring, { expires: 9999 });
			}
			$.cookie.json = true;
		}
		
		function check_cookie_name( string ,string_compare , del){
			var last_idx;
			if (!del) {
				if ( string==string_compare) del =true;
				if (string.substr(0,4) == 'sgKw'){
					last_idx = string.lastIndexOf(string_compare);
					if (last_idx!= -1 && (string.length == (last_idx + string_compare.length))) {
						del =true;
					}
				}
			}
			return del;
		}
		
		/*Räumt alter Cookies weg*/
		function cleanUpCookies(){
			var all_cookie = [];
			angular.forEach( $.cookie() ,function(cook, key){
				var cookie ={
					name:key,
					value:cook
				};
				all_cookie.push(cookie);
			});
			
			for (var i = all_cookie.length - 1; i >= 0; i--) {
			        var del = false;
					del = check_cookie_name(all_cookie[i].name,cookie_filiale,del);
					del = check_cookie_name(all_cookie[i].name,cookie_mitarbeiter,del);
					if (!del){
						angular.forEach( $scope.mitarbeiter, function ( mitarb, idx )  {
							if (!del) {
								del = check_cookie_name(all_cookie[i].name,mitarb.name,del);
							}
						})
					}
				
					if (del){
						all_cookie.splice(i,1)
					}
			}
			angular.forEach(all_cookie, function ( cook,key){
				$.removeCookie(cook.name);
			})
			
			
		}
		
		

		cleanUpCookies();
		
		function clear_kw_day_mitarbeiter(kw_idx,day_idx,mitarbeiter_idx){
			if (!$scope.kws[kw_idx]) return;
			if (!$scope.mitarbeiter) return;
			if (!$scope.kws[kw_idx].days[day_idx]) return;
			if (!$scope.kws[kw_idx].days[day_idx].mitarbeiter[mitarbeiter_idx]) return;
			if (!$scope.mitarbeiter[mitarbeiter_idx]) return;
			$scope.kws[kw_idx].days[day_idx].mitarbeiter[mitarbeiter_idx].uhrzeiten = angular.copy($scope.uhrzeiten);
		}
		
		$scope.getCalendarString = function (kw,weekday){
			var day_mili = 1000*60*60*24;
			var date = new Date($scope.filiale.year,0,1,0,0,0,0);
			var miliseconds = date.getTime();
			var day = date.getDay();
			var kw_start_datum = (kw-1) * 7 * day_mili;
			kw_start_datum = miliseconds + kw_start_datum  - (day - weekday-2) * day_mili;
			var date2 = new Date(kw_start_datum);
			var return_Date = $scope.days[weekday].val + ", den " + date2.getUTCDate() + "." + (date2.getUTCMonth()+1) + "." + date2.getFullYear();
			return return_Date;
		}

		$scope.change_filiale = function() {
            store_filale();
		}
		
		$scope.change_filiale_kw = function() {
			if ($scope.filiale.kw_von > $scope.filiale.kw_bis){
				$scope.filiale.kw_bis = $scope.filiale.kw_von;
			}
			generate_kws();
			store_filale();
		}

		function calcWochenStunden( kw ){
			kw.std = 0;
			angular.forEach( kw.days ,function(day, key){
				if (day.std>0){
					kw.std += day.std;
				}
			})
			if (kw.std==0) {
				kw.std="";
			}
		}

		function calcTagesStunden( day ){
			day.std = 0;
			angular.forEach( day.mitarbeiter ,function(mit, key){
				if (mit.stunden){
					day.std += mit.stunden;
				}
			})
			if (day.std==0) {
				day.std="";
			}
		}

		//Kalkuliert die Rest-Wochenstunden eines Mitarbeiters
		function calcMitarbeiterWochenRestunden (weekdays,mitarbeiter_idx) {
			var mitarbeiterWochenStd = 0;
			angular.forEach( weekdays,function(day, key){
				// Wochenstunden des Mitarbeiters
				if (day.mitarbeiter[mitarbeiter_idx].stunden) {
					mitarbeiterWochenStd += day.mitarbeiter[mitarbeiter_idx].stunden;
				}
			})
		
			angular.forEach( weekdays,function(day, key){
				day.mitarbeiter[mitarbeiter_idx].reststunden = ($scope.mitarbeiter[mitarbeiter_idx].std - mitarbeiterWochenStd) * -1;
			})
		}

		// Legt eine Kopie des Mitarbeiters und seiner Arbeitzeiten für den Wochentag an
		// Und speichert diese in einem Cookie
		$scope.calc_days = function() {
			calc_days();
		}
		
		
		function add_mitarbeiter($index){
			$scope.mitarbeiter.push({
				name: "Name" + $scope.mitarbeiter.length,
				std: 0
			});
			calc_days();
			change_kw_mitarbeiter();
		};
		
		
		function change_kw_mitarbeiter() {
			angular.forEach($scope.kws, function(kw, key1) {
				angular.forEach(kw.days, function(day, key2) {
					if (!day.mitarbeiter) day.mitarbeiter =[];
					angular.forEach($scope.mitarbeiter, function(mitarb, key2) {
						if (!day.mitarbeiter[key2]) {
							day.mitarbeiter[key2] = angular.copy(mitarb);
							day.mitarbeiter[key2].uhrzeiten = [];
							day.mitarbeiter[key2].uhrzeiten =  angular.copy($scope.uhrzeiten);
						} else {
							day.mitarbeiter[key2].name = mitarb.name;
							day.mitarbeiter[key2].std  = mitarb.std;
							calculate_mitarbeiter_tag(mitarb);
						}
					});

				});
				calcTagesStunden(kw.days);
				angular.forEach($scope.mitarbeiter, function(mitarb, mitarb_idx){
					calcMitarbeiterWochenRestunden( kw.days ,mitarb_idx);
				});
				calcWochenStunden(kw);
			});
		}
		
		
		
		$scope.change_mitarbeiter = function() {
			calc_days();
			change_kw_mitarbeiter();
		}
		
		// Neuen Mitarbeiter anlegen
		$scope.add_mitarbeiter = function($index) {
			add_mitarbeiter($index);
		};
		
		
		function remove_mitarbeiter(index) {
			//calc_days();
			$scope.mitarbeiter.splice(index, 1);
			angular.forEach($scope.weekdays, function(day, key) {
				day.mitarbeiter.splice(index, 1);
			})
			
			angular.forEach($scope.kws, function(kw, key1) {
				angular.forEach(kw.days, function(day, key2) {
					day.mitarbeiter.splice(index, 1);
				});
			})
			cleanUpCookies();
		}

		// Mitarbeiter aus der Liste nehmen
		$scope.remove_mitarbeiter = function(index) {
			remove_mitarbeiter(index);
		}
		
		
		function calc_days() {
			angular.forEach( $scope.days,function(day, key){
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
			$.removeCookie(cookie_mitarbeiter);
			$.cookie(cookie_mitarbeiter, $scope.mitarbeiter, { expires: 9999 });
		}
		
		// Initialisert eine Arbeitswoche
		function init_week(kw_idx){
			//Über den Init-Parameter(TRUE,FALSE) wird bestimmt ob die Arbeitswoche aus einem Cookie ermittelt werden soll
			//oder mit Default-Werten initialisiert wird
			if (!$scope.days) {calc_days()};
			if (!$scope.days) return;
			$scope.kws[kw_idx].days = angular.copy($scope.days);
			$scope.kws[kw_idx].std  = "";
			$scope.kws[kw_idx].umsatz_ziel = 0;
			/*
			if (!init) {
				// wenn die Arbeitswoche aus einem Cookie ermittelt werden soll 
			}
			*/
			
		}

		// Funktion zum generieren der Kalenderwochen
		// Bestehend aus Wochentage / Mitarbeiter / Uhrzeiten
		function generate_kws(){
			$scope.kws=[];
			for (var kw_nr=$scope.filiale.kw_von; kw_nr<=$scope.filiale.kw_bis; kw_nr++) {
				$scope.kws.push({ kw: kw_nr});
				init_week($scope.kws.length-1,false);
				set_kw_by_cookie($scope.kws.length-1,false);
			}
		}
		
		//Erzeugen eines Html-Reports wird per HTML2Canvas Umgewandelt um dann per jsPDF zum PDF Konvertiert zu werden
		$scope.genOutput= function(kw){
			var html = "";
			html += '<div class="kwrender' + kw.kw.toString() +'" >';

			html += '<table>';
			html += '<tr>';
			html += '<td>Woche</td>';
			html += '<td>'+kw.kw+'</td>';
			html += '<td>Periode</td>';
			html += '<td>'+$scope.filiale.periode+'</td>';
			html += '<td>Filiale</td>';
			html += '<td>'+$scope.filiale.filnr+'</td>';
			html += '</tr>';
			html += '<tr>';
			html += '<td>von</td>';
			html += '<td>'+ $scope.getCalendarString(kw.kw , 0 ) +'</td>';
			html += '<td>bis:</td>';
			html += '<td>'+ $scope.getCalendarString(kw.kw , 5 ) + '</td>';
			html += '<td></td>';
			html += '<td></td>';
			html += '</tr>';
			html += '</table>';

			html += '<table class="pdfrender">';
			angular.forEach(kw.days,function(day, key) {
				//Setzen des WOchentages
				html += '<tr><th colspan="29" class="header1 day">' + $scope.getCalendarString(kw.kw , parseInt(key ) ) +'</th></tr>';
				//Setzen der Zeitleiste des Wochentages
				html += '<tr><th></th>';
				angular.forEach($scope.uhrzeiten,function(uhrzeit, key2) {
					html += '<th colspan="2" class="time">' + uhrzeit.val + '</th>';
				})
				html += '<th class="time">von</th><th class="time">bis</th><th class="time" colspan="2">Stunden</th></tr>';
			
				//Für jeden Mitarbeiter seine Tages werte
				angular.forEach(day.mitarbeiter,function(mitarb, key3) {
					html += '<tr>';
					html += '<td class="data">'+ mitarb.name + '</td>';
					angular.forEach(mitarb.uhrzeiten,function(stunden, key4) {
						if (!stunden.voll) {
							html += '<td class="links white">&nbsp;</td>';
						} else {
							html += '<td class="links rot">&nbsp;</td>';
						}
						if (!stunden.halb) {
							html += '<td class="rechts white">&nbsp;</td>';
						} else {
							html += '<td class="rechts rot">&nbsp;</td>';
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
						html += '<td class="data td_right">'+ mitarb.stunden + '</td>';
					} else {
						html += '<td class="data"></td>';
					}
					if (key3==0) {
						if (mitarb.stunden) {
							html += '<td class="data tdcenter" rowspan="'+ $scope.mitarbeiter.length +'" >'+ day.std + '</td>';
						} else {
							html += '<td class="data tdcenter" rowspan="'+ $scope.mitarbeiter.length +'"></td>';
						}
					}
					html += '</tr>';
				});
			});
			html += '<tr>'
			html += '<td colspan ="23" class="td_nb_ld"></td>';
			html += '<td colspan ="4" >Summe Total:</td>';
			html += '<td colspan ="2"  class="td_right" >'+ kw.std + '</td>';
			html += '</tr>'
			html += '</table>';
			html += '<table class="pdf_mitarbeiter">';
			html += '<tr>'
			html += '<th>Mitarbeiter</th>';
			html += '<th>Stunden</th>';
			html += '<th class="noborder"></th>';
			html += '</tr>'
			angular.forEach($scope.mitarbeiter, function ( mitarb,idx) {
				html += '<tr>'
				html += '<td>'+ mitarb.name + '</td>';
				html += '<td>'+ kw.days[0].mitarbeiter[idx].reststunden + '</td>';
				html += '<td class="noborder"></td>';
				html += '</tr>'
				
			});
			html += '</tr>'
			html += '</table>';
			html += '</div>';
			return html;
			
		}
		
		//Berechner der Gesamt Wochenstundenzahl aller Mitarbeiter
		$scope.weektotal = function() {
			var total = 0;
			angular.forEach($scope.mitarbeiter, function(item) {
				total += item.std;
			})
			return total;
		}
		
		//Funktionen zum ermitteln der Tagesarbeitzeiten eines Mitarbeiter
		function calculate_mitarbeiter_tag(mitarbeiter) {
			var dec = 0;
			var uhrzeiten = angular.copy( mitarbeiter.uhrzeiten);
			var voll = $filter('filter')(uhrzeiten,{voll:true},true);
			var halb = angular.copy($filter('filter')(uhrzeiten,{halb:true},true));
			mitarbeiter.von = "";
			mitarbeiter.bis = "";
			
			if (!voll) {
				voll = [];
				voll[0] = {val : "24:00",intval:2400};
				dec = 1;
			}
			if (!halb) {
				halb = [];
				halb[0] = {val: "24:00",intval:2400};
				dec = 1;
			}
		
			if (!voll[0]) {
				voll[0] = {val : "24:00",intval:2400};
				dec = 1;
			}		
			if (!halb[0]) {
				halb[0] = {val:"24:00",intval:2400};
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
			if (!mitarbeiter.von && !mitarbeiter.bis){
				mitarbeiter.stunden="";
			}
		}
		
		function calc_mitarbeiter_tag(kw,days_idx,mitarbeiter_idx){
			if (!kw.days[days_idx].mitarbeiter[mitarbeiter_idx]) return;
			calculate_mitarbeiter_tag(kw.days[days_idx].mitarbeiter[mitarbeiter_idx]);
			//Berechnen der Restwochenstunden
			calcMitarbeiterWochenRestunden( kw.days ,mitarbeiter_idx); 
			//Berechnen der Stunden eines Arbeitstages
			calcTagesStunden(kw.days[days_idx]);
			calcWochenStunden(kw);
		}
		
		// Hier werden die Arbeitsstart und Endzeiten gesetzt
		// Aufruf bei dem setzen der Checkbox
		$scope.calc_mitarbeiter_tag = function(kw,days_idx,mitarbeiter_idx){
			//console.log("$scope.calc_mitarbeiter_tag(" +JSON.stringify(kw)  + ")");
			calc_mitarbeiter_tag(kw,days_idx,mitarbeiter_idx);
		}

		
		/* #############################################################
		Funktionen zum Löschen, Anlegen und Speichern der Kalenderwochen
		##############################################################*/
		$scope.save_kws = function (){
			if (!$scope.kws) return;
			angular.forEach($scope.kws, function (kw,kw_idx){
				store_kw(kw_idx);
			});
		}
		
		$scope.load_kws = function (){
			if (!$scope.kws) return;
			angular.forEach($scope.kws, function (kw,kw_idx){
				set_kw_by_cookie(kw_idx,true);
			});
		}
		
		$scope.clear_kws = function (){
			if (!$scope.kws) return;
			angular.forEach($scope.kws, function (kw,kw_idx){
				clear_kw(kw_idx);
			});
		}
		
		/* #############################################################
		Funktionen zum Löschen, Anlegen und Speichern der Kalenderwochen
		##############################################################*/
		function store_kw(kw_idx){
			console.log("store_kw(" +kw_idx  + ")");
			if (!$scope.kws[kw_idx]) return;
			angular.forEach( $scope.kws[kw_idx].days, function( day,day_idx){
				store_kw_day(kw_idx,day_idx);
			});
			alert("Kalenderwoche " + $scope.kws[kw_idx].kw + " gespeichert.");
			
		}
		function clear_kw(kw_idx){
			console.log("clear_kw(" +kw_idx  + ")");
			if (!$scope.kws[kw_idx]) return;
			if (!$scope.kws[kw_idx].days) return;
			init_week(kw_idx);
		}
		function set_kw_by_cookie(kw_idx, init){
			console.log("set_kw_by_cookie(" +kw_idx  + ",init)");
			if (!$scope.kws[kw_idx]) return;
			if (!$scope.kws[kw_idx].days) return;
			angular.forEach( $scope.kws[kw_idx].days, function( day , day_idx){
				set_kw_day_by_cookie(kw_idx,day_idx,init);
			})
			angular.forEach( $scope.mitarbeiter, function ( mitarb,mitarb_idx){
				calcMitarbeiterWochenRestunden( $scope.kws[kw_idx].days ,mitarb_idx); 
			});
			calcWochenStunden($scope.kws[kw_idx]);
		}
		$scope.save_kw = function(kw_idx) {
			console.log("$scope.save_kw(" +kw_idx  + ")");
			store_kw(kw_idx);
		}
		$scope.clear_kw = function (kw_idx) {
			console.log("$scope.clear_kw(" +kw_idx  + ")");
			clear_kw(kw_idx);
			calcWochenStunden($scope.kws[kw_idx]);
		}
		$scope.load_kw = function(kw_idx) {
			console.log("$scope.load_kw(" +kw_idx  + ")");
			if (!$scope.kws) return;
			if (!$scope.kws[kw_idx]) return;
			set_kw_by_cookie(kw_idx,true);

		}
		/* ###################################################################
		Funktionen zum Löschen, Anlegen und Speichern der Wochen-Kalendertagen
		################################################################### */
		function store_kw_day(kw_idx,day_idx){
			console.log("store_kw_day(" +kw_idx + "," + day_idx + ")");
			if (!$scope.kws[kw_idx]) return;
			if (!$scope.kws[kw_idx].days[day_idx]) return;
			if (!$scope.kws[kw_idx].days[day_idx].mitarbeiter) return;
			angular.forEach( $scope.kws[kw_idx].days[day_idx].mitarbeiter ,function(mitarb, key){
				store_kw_day_mitarbeiter(kw_idx,day_idx,key);
			})
		}
		function clear_kw_day(kw_idx,day_idx){
			console.log("clear_kw_day(" +kw_idx + "," + day_idx + ")");
			if (!$scope.kws[kw_idx]) return;
			if (!$scope.kws[kw_idx].days[day_idx]) return;
			if (!$scope.kws[kw_idx].days[day_idx].mitarbeiter) return;
			angular.forEach( $scope.kws[kw_idx].days[day_idx].mitarbeiter ,function(mitarb, mitarb_idx){
				clear_kw_day_mitarbeiter(kw_idx,day_idx,mitarb_idx);
			})
		}
		function set_kw_day_by_cookie(kw_idx,day_idx,init){
			console.log("set_kw_day_by_cookie(" +kw_idx + "," + day_idx + ",init)");

			if (!$scope.kws[kw_idx]) return;
			if (!$scope.kws[kw_idx].days[day_idx]) return;
			angular.forEach($scope.kws[kw_idx].days[day_idx].mitarbeiter, function(mitarb,mit_idx){
				set_kw_day_mitarbeiter_by_cookie(kw_idx,day_idx,mit_idx,init);
			});
			calcTagesStunden($scope.kws[kw_idx].days[day_idx]);

		}
		$scope.save_kw_day = function(kw_idx,day_idx) {
			console.log("$scope.save_kw_day(" +kw_idx + "," + day_idx + ")");
		
			store_kw_day(kw_idx,day_idx);
			alert($scope.days[day_idx].val + " von der Kalenderwoche " + $scope.kws[kw_idx].kw + " ist gespeichert.");
			
		}
		$scope.clear_kw_day = function (kw_idx,day_idx) {
			console.log("$scope.clear_kw_day(" +kw_idx + "," + day_idx + ")");

			clear_kw_day(kw_idx,day_idx);
			angular.forEach( $scope.mitarbeiter, function ( mitarb,mitarb_idx){
				calc_mitarbeiter_tag($scope.kws[kw_idx],day_idx,mitarb_idx);
				calcMitarbeiterWochenRestunden( $scope.kws[kw_idx].days ,mitarb_idx); 
			});
			calcTagesStunden($scope.kws[kw_idx].days[day_idx]);
			calcWochenStunden($scope.kws[kw_idx]);
			
		}
		$scope.load_kw_day = function(kw_idx,day_idx) {
			console.log("$scope.load_kw_day(" +kw_idx +"," + day_idx + ")");
			if (!$scope.kws) return;
			if (!$scope.kws[kw_idx]) return;
			set_kw_day_by_cookie(kw_idx,day_idx,true);
			angular.forEach( $scope.mitarbeiter, function ( mitarb,mitarb_idx){
				calc_mitarbeiter_tag($scope.kws[kw_idx],day_idx,mitarb_idx);
				calcMitarbeiterWochenRestunden( $scope.kws[kw_idx].days ,mitarb_idx); 
			});
			calcTagesStunden($scope.kws[kw_idx].days[day_idx]);
			calcWochenStunden($scope.kws[kw_idx]);
		}
		/* ###############################################################################
		Funktionen zum Löschen, Anlegen und Speichern des Mitarbeiter Wochen-Kalendertages
		################################################################################*/
		function set_kw_day_mitarbeiter_by_cookie(kw_idx,day_idx, mit_idx ,init){
			console.log("set_kw_day_mitarbeiter_by_cookie(" +kw_idx +"," + day_idx + "," + mit_idx + ",init)");
			var mitarbeiter = $scope.kws[kw_idx].days[day_idx].mitarbeiter[mit_idx];
			if (!mitarbeiter) return;
			var cookie_name = getKwDayMitarbeiterCookieName($scope.kws[kw_idx].kw,day_idx,mit_idx);
			$.cookie.json = false;
			var uhrzeiten = $.cookie(cookie_name);
			$.cookie.json = true;
			if (uhrzeiten){
				mitarbeiter.uhrzeiten = parse_base36_uhrzeit(uhrzeiten);
			} else if (init){
				mitarbeiter.uhrzeiten = angular.copy($scope.uhrzeiten);
			} 
			calculate_mitarbeiter_tag(mitarbeiter);
		}
		
		
		$scope.save_kw_day_mitarbeiter = function(kw_idx,day_idx,mitarb_idx) {
			console.log("$scope.save_kw_day_mitarbeiter(" +kw_idx + "," + day_idx +  "," + mitarb_idx + ")");

			store_kw_day_mitarbeiter(kw_idx,day_idx,mitarb_idx);
			alert("Mitarbeiter:"+ $scope.mitarbeiter[mitarb_idx].name + " für den " + $scope.days[day_idx].val + " von der Kalenderwoche " + $scope.kws[kw_idx].kw + " ist gespeichert.");
			
		}
		$scope.clear_kw_day_mitarbeiter = function (kw_idx,day_idx,mitarb_idx) {
			console.log("$scope.clear_kw_day_mitarbeiter(" +kw_idx + "," + day_idx +  "," + mitarb_idx + ")");
			clear_kw_day_mitarbeiter(kw_idx,day_idx,mitarb_idx);
			calc_mitarbeiter_tag($scope.kws[kw_idx],day_idx,mitarb_idx);
			calcMitarbeiterWochenRestunden( $scope.kws[kw_idx].days ,mitarb_idx);
			angular.forEach($scope.kws[kw_idx].days, function (days, idx ){
				calcTagesStunden(days);
			});
			calcWochenStunden($scope.kws[kw_idx]);
			
		}
		$scope.load_kw_day_mitarbeiter = function(kw_idx,day_idx,mitarb_idx) {
			console.log("$scope.load_kw_day_mitarbeiter(" +kw_idx + "," + day_idx +  "," + mitarb_idx + ")");

			if (!$scope.kws[kw_idx]) return;
			if (!$scope.kws[kw_idx].days[day_idx]) return;
			if (!$scope.kws[kw_idx].days[day_idx].mitarbeiter[mitarb_idx]) return;
			//var mitarbeiter = $scope.kws[kw_idx].days[day_idx].mitarbeiter[mitarb_idx];
			set_kw_day_mitarbeiter_by_cookie(kw_idx,day_idx,mitarb_idx,true);
			calcMitarbeiterWochenRestunden( $scope.kws[kw_idx].days ,mitarb_idx);
			angular.forEach($scope.kws[kw_idx].days, function (days, idx ){
				calcTagesStunden(days);
			});
			calcWochenStunden($scope.kws[kw_idx]);
		}
		
		//Wenn es noch keine gepflegte Mitarbeiter gibt wird hier das Mitarbeiter-Array initialisert
        if (!$scope.mitarbeiter){
			$scope.mitarbeiter = [];
		} else {
			calc_days();
			generate_kws();
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
	.directive('ngModelOnblur', function() {
		return {
		    // Directive um on-Change zu emulieren
			restrict: 'A',
			require: 'ngModel',
			priority: 1, // needed for angular 1.2.x
			link: function(scope, elm, attr, ngModelCtrl) {
				if (attr.type === 'radio' || attr.type === 'checkbox') return;

				elm.unbind('input').unbind('keydown').unbind('change');
				elm.bind('blur', function() {
					scope.$apply(function() {
						ngModelCtrl.$setViewValue(elm.val());
					});         
				});
			}
		};
	})
	;