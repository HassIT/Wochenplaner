angular
	.module('wochenplaner')
	.controller('wochenplanerCtrl', ['$scope',  function($scope) {
		/* 	Applikation: Store-Wochenplaner
			Developed by Stefan Haß
		*/

     	$scope.pagetitle = "Wochenplaner"
		$scope.counter = 0;
		
		// Neuen Mitarbeiter anlegen
		$scope.addItem = function() {
			$scope.mitarbeiter.push({
				name: "Name eintragen",
				std: 0
			});
			$scope.calc_days();
		};
		
		// Mitarbeiter aus der Liste nehmen
		$scope.removeItem = function(index) {
			$scope.mitarbeiter.splice(index, 1);
			angular.forEach($scope.weekdays, function(day, key) {
				day.mitarbeiter.splice(index, 1);
			})
			$scope.calc_days();
		}
		
		function generate_Canvas_Kw( test,kw_nr ){
			angular.element(document.querySelector(test)).attr('style','display:block;');
			html2canvas(document.querySelector(test), {
				onrendered: function(canvas) {
					angular.element(document.querySelector(test)).attr('style','display:none;');
					var imgData;
					imgData = canvas.toDataURL('image/jpeg');
					var doc = new jsPDF('landscape',"mm","a4");
					doc.addImage(imgData, 'JPEG', 15, 15, 267,180  );
					setTimeout(function(){
						doc.save('wochenplan'+ kw_nr + '.pdf');	
					}, 4000);
				}
			});		
		}

		// Erzeugen einer HTML-Tabelle
		// => erzeuge ein JPG von dieser Tabelle
		// => erzeuge ein PDF für den Download
		$scope.generierePdf =  function() {
			$scope.doc ="";
			angular.forEach($scope.kws, function(kw, idx) {
				$scope.doc += $scope.genOutput(kw);
				setTimeout(function(){
					generate_Canvas_Kw(".kwrender"+kw.kw, kw.kw);				
				}, idx * 3000);
				
			});
		}
  }]);