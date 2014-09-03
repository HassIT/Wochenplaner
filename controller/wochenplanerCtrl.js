angular
	.module('wochenplaner')
	.controller('wochenplanerCtrl', ['$scope',"$window",  function($scope, $window) {

     	$scope.pagetitle = "Wochenplaner"
		






		
	
	
	
	
		$scope.addItem = function() {
			$scope.mitarbeiter.push({
				name: "Name eintragen",
				std: 0
			});
			$scope.weekdays2();
			
		},

		$scope.removeItem = function(index) {
			$scope.mitarbeiter.splice(index, 1);
			angular.forEach($scope.weekdays, function(day, key) {
				day.mitarbeiter.splice(index, 1);
			})
			$scope.weekdays2();
		
		
		},


	
	


		$scope.generierePdf =  function() {
			$scope.genOutput();
			var imgData;
			html2canvas(document.querySelector('#outputtable'), {
				onrendered: function(canvas) {
					imgData = canvas.toDataURL('image/jpeg');
					var doc = new jsPDF('landscape',"mm","a4");
					doc.addImage(imgData, 'JPEG', 15, 15, 267,180  );
					doc.save('wochenplan.pdf');	
				
				}
			});		
		}
  }]);