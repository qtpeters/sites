
angular.module( 'workouts', ['ngResource'])
	.controller( 'Main', function( $scope, WorkoutService, CouchDBService ) {
		
		$scope.workouts;
		WorkoutService.get( {}, function( $response, $headers ) {
			$scope.workouts = $response.workouts;
			
			$scope.workouts.forEach( function( workout ) {
				CouchDBService.save( workout );
			});
			
		});
		
	})
	
	.factory( 'WorkoutService', function( $resource ) {
		return $resource( '/data/data.json' );
	})
	
	.factory( 'CouchDBService', function( $resource ) {
		return $resource( 'http://localhost:5984/workouts' );
	});
