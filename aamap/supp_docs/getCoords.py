#!/usr/bin/env python
# latlong VARCHAR(30)
import MySQLdb
from lxml import etree
import StringIO
from urlparse import urlparse, parse_qs

db = MySQLdb.connect( 
	host="localhost",
	user="aa",
	passwd="12steps",
	db="aamap")

cur = db.cursor()

cur.execute( "SELECT id,mapquest FROM location" )

for row in cur.fetchall():
	
	try:
		
		record_id = row[0]
		
		root = etree.XML( "<top>" + row[1] + "</top>" )
		tag = etree.XPath( '/top/small/a' )
		atag = tag( root )[0]
		attrib = atag.attrib
		parsed_url = urlparse( attrib[ 'href' ] )
		latlong =  parse_qs( parsed_url.query )["ll"][0]
		cur.execute( "UPDATE location SET latlong='" + latlong + "' WHERE id=" + str( record_id ) )
		
	except Exception as e:
		print "Exception, id: " + str( row[0] ) + " <" + str( e ) + ">"
