



SELECT a.gp_name, a.AAIG_num, m.day, m.time, m.language, l.loc_name, l.addr1, l.city, l.county, l.latlong, m.code 
FROM aagroup as a, meeting as m, location as l, type as t 
WHERE a.id=m.group_id AND l.id=m.location_id AND t.id=m.mtg_type AND m.code RLIKE ''; 
