
angular.module( 'workouts', ['ngResource'])
	.controller( 'Main', function( $scope, WorkoutService ) {
		
		$scope.workouts;
		WorkoutService.get( {}, function( $response, $headers ) {
			$scope.workouts = $response.workouts;
		});
		
	})
	
	.factory( 'WorkoutService', function( $resource ) {
		return $resource( '/data/data.json' );
	});
