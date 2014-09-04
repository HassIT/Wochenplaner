angular
	.module('wochenplaner')
	.controller('wochenplanerCtrl', ['$scope',  function($scope) {

     	$scope.pagetitle = "Wochenplaner"
		$scope.counter = 0;
	
		// Neuen Mitarbeiter anlegen
		$scope.addItem = function() {
			$scope.mitarbeiter.push({
				name: "Name eintragen",
				std: 0
			});
			$scope.weekdays2();
			
		},
		
		// Mitarbeiter aus der Liste nehmen
		$scope.removeItem = function(index) {
			$scope.mitarbeiter.splice(index, 1);
			angular.forEach($scope.weekdays, function(day, key) {
				day.mitarbeiter.splice(index, 1);
			})
			$scope.weekdays2();
		}


		// Erzeugen einer HTML-Tabelle
		// => erzeuge ein JPG von dieser Tabelle
		// => erzeuge ein PDF für den Download
		$scope.generierePdf =  function() {
			$scope.genOutput();
			angular.element(document.querySelector('#outputtable')).attr('style','display:block;');
			
			html2canvas(document.querySelector('#outputtable'), {
				onrendered: function(canvas) {
					angular.element(document.querySelector('#outputtable')).attr('style','display:none;');
					var imgData;
					imgData = canvas.toDataURL('image/jpeg');
					var doc = new jsPDF('landscape',"mm","a4");
					doc.addImage(imgData, 'JPEG', 15, 15, 267,180  );
					setTimeout(function(){
						doc.save('wochenplan.pdf');	
						//my code
					}, 4000);
				}
			});		
		}
  }]);