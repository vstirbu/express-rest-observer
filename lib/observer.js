/*
    express-rest-observer
    
    The MIT License (MIT)
    Copyright (c) 2013 Vlad Stirbu
*/

module.exports = observer;

function observer(options) {
	'use strict';
	
	var options = options || {},
			path = options.path || '/observers',
			
			express = require('express'),
			boundary_string = require('node-uuid').v4(),
			app = express(),
			
			clients = [];
	
	/**
	 * Delivers events to recipients
	 * @param {type} change Description
	 */
	function deliver(change) {
		var fragmens = [],
				message;

		fragmens.push('--' + boundary_string);
		
		switch (change.statusCode) {
		case 200:
			fragmens.push('HTTP/1.1 204 No Content');
			fragmens.push('Content-Type: message/external-body; access-type=http');
			fragmens.push('Content-ID: ' + change.url);
			fragmens.push('');
			break;
		case 410:
			fragmens.push('HTTP/1.1 410 Gone');
			fragmens.push('Content-Location: ' + change.url);
			fragmens.push('');
			break;
		default:
		}
		
		message = fragmens.join('\n');
		
		clients.forEach(function(value) {
			value.write(message);
		});
	}
	
	app.middleware = function (req, res, next) {
		res.on('header', function () {
			res.links({
				monitor: path
			});
		});
		
		req.on('end', function () {
			switch (req.method) {
			case 'DELETE':
				if (res.statusCode >= 200 && res.statusCode < 300) {
					deliver({
						statusCode: 410,
						url: req.path
					});
				}
				break;
			case 'POST':
				if (res.statusCode >= 200 && res.statusCode < 300) {
					deliver({
						statusCode: 200,
						url: req.path
					});
				}
				break;
			case 'PUT':
				break;
			default:
			}
		});
		
		next();
	};
	
	/**
	 * Delivery channel for notifications
	 */
	app.get(path, function (req, res) {
		console.log(clients.indexOf(res));
		if (clients.indexOf(res) < 0) {
			clients.push(res);
			console.log('connected clients:', clients.length);
		}
		res.type('multipart/mixed; boundary="' + boundary_string +'"');
		res.write('\n');
		
		req.on('end', function () {
			clients.splice(clients.indexOf(res), 1);
		});
		
		req.on('close', function() {
			clients.splice(clients.indexOf(res), 1);
		});
	});
	
	return app;
}
