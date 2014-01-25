
<?php

	/*
	 * Database information
	 */
	$host = '127.0.0.1';
	$dbuser = 'aa';
	$dbpass = '12steps';
	$database = 'aamap';

	$dayNumToDayName = array(
		0 => "Sunday",
		1 => "Monday",
		2 => "Tuesday",
		3 => "Wednesday",
		4 => "Thursday",
		5 => "Friday",
		6 => "Saturday",
	);

	$dayParamToDay = array(
		'mon' => 1,
		'tue' => 2,
		'wed' => 3,
		'thu' => 4,
		'fri' => 5,
		'sat' => 6,
		'sun' => 0,
	);

	$typeParamToType = array(
		'W' => 'W',
		'G' => 'G',
		'S' => 'S',
		'C' => 'C'
	);

	$after = $_GET['stime'];
	$before = $_GET['etime'];

	$where_clause = "";
	if ( $_GET[ 'day' ] != 'any' ) {
		$day = $dayParamToDay[ $_GET[ 'day' ] ];
		$where_clause .= " AND m.day=" . $day;
	} 

	if ( $_GET[ 'type' ] != 'any' ) {
		$type = $typeParamToType[ $_GET['type'] ];
		$where_clause .= " AND m.code RLIKE '" . $type . "'";
	}	

	ini_set('display_errors',1); 
 	error_reporting(E_ALL);

	$mysqli = new mysqli( $host, $dbuser, $dbpass, $database );

	if ( ! $mysqli->connect_errno ) {
		
		$query = "SELECT a.gp_name, a.AAIG_num, m.day, m.time, m.language, m.code as type, " 
		. "l.loc_name, l.addr1, l.city, l.county, l.latlong "
		. "FROM aagroup as a, meeting as m, location as l, type as t "
		. "WHERE a.id=m.group_id AND l.id=m.location_id AND t.id=m.mtg_type" . $where_clause . " ORDER BY l.latlong";
 
		$qfile = fopen("/tmp/last.txt", "w");
		fwrite( $qfile, $query );
		fwrite( $qfile, "\n\n----------------------\n\n" );

		$qr = $mysqli->query( $query );

		if ( $qr ) {
				
			$resultsJsonArray = array();
			for ( $i=0; $i<$qr->num_rows; $i++ ) {
				$qr->data_seek( $i );
				$row = $qr->fetch_assoc();
				$row["day"] = $dayNumToDayName[$row["day"]];
				$time = $row["time"];

				if ( ! array_key_exists( $row['latlong'], $resultsJsonArray ) ) {
					$resultsJsonArray[$row['latlong']] = array();
				};

				if ( $before == 'any' && $after == 'any' ) {
					array_push( $resultsJsonArray[$row['latlong']], $row );
				} else if ( $time <= $before && $after == 'any' ) {
					array_push( $resultsJsonArray[$row['latlong']], $row );
				} else if ( $before == 'any' && $time >= $after ) {
					array_push( $resultsJsonArray[$row['latlong']], $row );
				} else if ( $time <= $before && $time >= $after ) {
					array_push( $resultsJsonArray[$row['latlong']], $row );
				}
				fwrite( $qfile, $row['latlong'] . "\n" );

			}

			$tlJsonObj = array();
			$tlJsonObj['results'] = $resultsJsonArray;
		
			$json = json_encode( $tlJsonObj );
			header( 'Content-type: application/json' );
			echo $json;

		} else {
			echo $mysqli->error;
			//header( 'Content-type: text/html' );
			//echo "<h2>" . $query_result . "</h2>";
			echo "Failed, no query result\n";
		}
		
		fclose( $qfile );

	} else {
		echo "Failed, mysqli_connect_failed\n";
	}

?>
