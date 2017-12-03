
// Dependencies
var express = require('express');
var router = express.Router();

//Product
var Appointment = require('./model');
Appointment.methods(['put', 'post', 'delete']);
Appointment.register(router, '/appointments');

router.get('/appointments', function (req, res) {
	try{
			var start = req.headers.start;
			var end = req.headers.end;
			var range = {};

			range.date = {
				"$gte": start,
				"$lte": end
			}

			Appointment.find(range, (err, appointments) => {
				if (err) {
					res.send(err);
				} else {
					res.json(appointments);
				}
			});
		
	} catch(e) {
		console.log(e);
	}
});

// Return router
module.exports = router;
